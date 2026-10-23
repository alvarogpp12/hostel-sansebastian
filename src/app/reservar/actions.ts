"use server";

import { headers } from "next/headers";
import { bookingProvider, checkoutMode } from "@/content/booking";
import { createBooking, isDatabaseConfigured, updateBooking, type StoredRequest } from "@/lib/bookings";
import { createReservation, getAvailability, isTestMode } from "@/lib/redforts/api";
import { isRedfortsConfigured, RedfortsError } from "@/lib/redforts/client";
import { describeError, getInventory, pickLang } from "@/lib/redforts/inventory";
import { resolveSelection, type ResolvedSelection } from "@/lib/redforts/pricing";
import { checkoutSchema, guestFieldFormats } from "@/lib/redforts/schemas";
import type { InventoryResponse, Lang, ReservationGuest } from "@/lib/redforts/types";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; errors: string[]; fieldErrors?: Record<string, string>; newTotal?: number };

const SITE_LANG = "es";
const UNAVAILABLE = "La reserva online no está disponible ahora mismo. Escríbenos o llámanos.";

/** Campos del huésped que se aceptan del formulario (nunca card_*) */
const GUEST_KEYS = new Set<keyof ReservationGuest>([
  "firstnames",
  "middlenames",
  "surname",
  "surname2",
  "address",
  "postalcode",
  "town",
  "state",
  "country",
  "email",
  "phone",
  "phone2",
  "arrival_time",
  "departure_time",
]);

function validateGuest(
  raw: Record<string, string>,
  inventory: InventoryResponse,
): { guest: ReservationGuest } | { fieldErrors: Record<string, string> } {
  const required = new Set(["surname", "email", ...inventory.fields.filter((f) => f.required).map((f) => f.id)]);
  const allowed = new Set(["surname", "email", ...inventory.fields.map((f) => f.id)]);
  const fieldErrors: Record<string, string> = {};
  const guest: Record<string, string> = {};

  for (const id of allowed) {
    if (id.startsWith("card_") || !GUEST_KEYS.has(id as keyof ReservationGuest)) continue;
    const value = (raw[id] ?? "").trim();
    if (!value) {
      if (required.has(id)) fieldErrors[id] = "Campo obligatorio";
      continue;
    }
    const format = guestFieldFormats[id];
    const checked = format?.safeParse(value);
    if (checked && !checked.success) {
      fieldErrors[id] = checked.error.issues[0]?.message ?? "Valor no válido";
      continue;
    }
    guest[id] = value;
  }
  if (Object.keys(fieldErrors).length) return { fieldErrors };
  return { guest: guest as ReservationGuest };
}

async function siteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

type Prepared = {
  inventory: InventoryResponse;
  lang: Lang;
  guest: ReservationGuest;
  resolved: ResolvedSelection;
  total: number;
  request: StoredRequest;
};

/**
 * Común a los dos pagos: valida el formulario, revalida la selección con
 * /availability EN EL SERVIDOR y calcula el importe aquí (nunca se fía del
 * precio del navegador).
 */
async function prepare(input: unknown): Promise<{ prepared: Prepared } | { result: CheckoutResult; inventory?: InventoryResponse }> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) return { result: { ok: false, errors: parsed.error.issues.map((i) => i.message) } };
  const { search, selection, guest: rawGuest, notes, consent, expectedTotal } = parsed.data;

  const inventory = await getInventory();
  const lang = pickLang(inventory, SITE_LANG);

  const checkedGuest = validateGuest(rawGuest, inventory);
  if ("fieldErrors" in checkedGuest) {
    return { inventory, result: { ok: false, errors: ["Revisa los datos marcados."], fieldErrors: checkedGuest.fieldErrors } };
  }

  // La única fuente de verdad: disponibilidad y precio recién pedidos a Redforts.
  const availability = await getAvailability({
    arrival: search.arrival,
    departure: search.departure,
    ...(search.promo ? { promo: search.promo } : {}),
  });
  const resolved = resolveSelection(availability, selection, search.adults, search.children);
  if ("error" in resolved) return { inventory, result: { ok: false, errors: [resolved.error] } };

  const { total } = resolved.breakdown;
  if (Math.abs(total - expectedTotal) > 0.009) {
    return {
      inventory,
      result: {
        ok: false,
        newTotal: total,
        errors: [`El precio ha cambiado desde tu búsqueda: ahora son ${total.toFixed(2)} €. Revisa la selección y vuelve a confirmar.`],
      },
    };
  }
  if (Math.round(total * 100) <= 0) return { inventory, result: { ok: false, errors: ["El importe de la reserva no es válido."] } };

  const request: StoredRequest = {
    ...checkedGuest.guest,
    arrival: resolved.arrival,
    departure: resolved.departure,
    accos: resolved.accos,
    lang,
    consent: inventory.languages[lang]?.consent_title ? consent : undefined,
    ...(search.promo ? { promo: search.promo } : {}),
    ...(notes ? { guest_notes: notes } : {}),
  };
  return { prepared: { inventory, lang, guest: checkedGuest.guest, resolved, total, request } };
}

/**
 * Pago con el TPV virtual de Redforts (checkoutMode "tpv"): crea la reserva
 * en Redforts SIN ignore_prepayment, así que queda «pendiente de pago», y
 * devuelve el enlace de Redforts donde el huésped la paga. Si no la paga,
 * Redforts la anula sola (unos 30 min). La web no ve ni guarda la tarjeta.
 *
 * La reserva es siempre real (ver createReservation): con api_test no hay
 * enlace de pago.
 */
export async function startTpvReservation(input: unknown): Promise<CheckoutResult> {
  if (bookingProvider() !== "redforts") return { ok: false, errors: ["La reserva online no está activa."] };
  // Solo en modo "tpv": nadie debe poder crear reservas llamando a la acción a mano.
  if (checkoutMode() !== "tpv") return { ok: false, errors: ["El pago online no está activo."] };
  if (!isRedfortsConfigured()) {
    console.error("[tpv] falta la configuración de Redforts");
    return { ok: false, errors: [UNAVAILABLE] };
  }

  let inventory: InventoryResponse | null = null;
  try {
    const prep = await prepare(input);
    if ("result" in prep) return prep.result;
    inventory = prep.prepared.inventory;
    const { guest_notes: notes, ...request } = prep.prepared.request;

    let result;
    try {
      result = await createReservation({ ...request, status: "confirmed", ...(notes ? { notes } : {}) }, { real: true });
    } catch (error) {
      if (error instanceof RedfortsError && error.kind !== "api") {
        // Red o timeout: no sabemos si se ha creado. No se reintenta (podría duplicarla).
        console.error("[tpv] 🚨 REVISAR: no se sabe si la reserva se ha creado", error);
        return {
          ok: false,
          errors: [
            "No hemos podido confirmar tu reserva. Antes de volver a intentarlo, escríbenos por WhatsApp o llámanos y lo comprobamos: no se te ha cobrado nada.",
          ],
        };
      }
      throw error;
    }

    if (result.status === "error" || !result.url) {
      console.error("[tpv] 🚨 REVISAR: Redforts no devolvió enlace de pago", { status: result.status, id: result.id, errors: result.errors });
      return {
        ok: false,
        errors: [
          result.id
            ? `Tu reserva (nº ${result.id}) se ha registrado, pero no hemos podido abrir el pago. Escríbenos por WhatsApp o llámanos y lo terminamos contigo.`
            : "No hemos podido crear la reserva. Escríbenos por WhatsApp o llámanos y te ayudamos.",
        ],
      };
    }
    console.info("[tpv] reserva creada, pendiente de pago", {
      id: result.id,
      status: result.status,
      prepayment_required: result.prepayment_required,
    });
    return { ok: true, url: result.url };
  } catch (error) {
    console.error("[tpv] error", error);
    return { ok: false, errors: describeError(error, inventory, SITE_LANG) };
  }
}

/**
 * Pago con Stripe (checkoutMode "pay"): guarda la reserva pendiente en la
 * base de datos y crea la sesión de Stripe Checkout con el cobro solo
 * autorizado (capture_method: manual). La reserva en Redforts la crea el
 * webhook cuando Stripe confirma la autorización.
 */
export async function startCheckout(input: unknown): Promise<CheckoutResult> {
  if (bookingProvider() !== "redforts") return { ok: false, errors: ["La reserva online no está activa."] };
  // Solo en modo "pay": nadie debe poder crear pagos llamando a la acción a mano.
  if (checkoutMode() !== "pay") return { ok: false, errors: ["El pago online no está activo."] };
  if (!isRedfortsConfigured() || !isStripeConfigured() || !isDatabaseConfigured()) {
    console.error("[checkout] falta configuración", {
      redforts: isRedfortsConfigured(),
      stripe: isStripeConfigured(),
      db: isDatabaseConfigured(),
    });
    return { ok: false, errors: [UNAVAILABLE] };
  }

  let inventory: InventoryResponse | null = null;
  try {
    const prep = await prepare(input);
    if ("result" in prep) return prep.result;
    inventory = prep.prepared.inventory;
    const { lang, guest, resolved, total, request } = prep.prepared;
    const amountCents = Math.round(total * 100);

    const booking = await createBooking({
      amount_cents: amountCents,
      currency: resolved.currency,
      arrival: resolved.arrival,
      departure: resolved.departure,
      lang,
      test_mode: isTestMode(),
      request,
    });

    const origin = await siteOrigin();
    const nights = resolved.accos[0].periods.reduce((n, p) => n + p.days, 0);
    const description = `Enjoy Comfort · ${resolved.arrival} → ${resolved.departure} · ${nights} ${
      nights === 1 ? "noche" : "noches"
    } · ${resolved.accos.length} ${resolved.accos.length === 1 ? "habitación" : "habitaciones"}`;

    const session = await getStripe().checkout.sessions.create(
      {
        mode: "payment",
        locale: "es",
        customer_email: guest.email,
        client_reference_id: booking.id,
        metadata: { booking_id: booking.id },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: resolved.currency.toLowerCase(),
              unit_amount: amountCents,
              product_data: { name: "Reserva en Enjoy Comfort San Sebastián", description },
            },
          },
        ],
        payment_intent_data: {
          // Solo se autoriza: se cobra cuando Redforts confirma la reserva.
          capture_method: "manual",
          description,
          metadata: { booking_id: booking.id },
        },
        // El mínimo que permite Stripe; la opción puede venderse en una OTA mientras tanto.
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        success_url: `${origin}/reservar/confirmada?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/reservar?pago=cancelado`,
      },
      { idempotencyKey: `checkout-${booking.id}` },
    );

    await updateBooking(booking.id, { stripe_session_id: session.id });
    if (!session.url) throw new Error("Stripe no devolvió la URL de pago.");
    return { ok: true, url: session.url };
  } catch (error) {
    console.error("[checkout] error", error);
    return { ok: false, errors: describeError(error, inventory, SITE_LANG) };
  }
}
