"use server";

import { headers } from "next/headers";
import { bookingProvider } from "@/content/booking";
import { createBooking, isDatabaseConfigured, updateBooking, type StoredRequest } from "@/lib/bookings";
import { getAvailability, isTestMode } from "@/lib/redforts/api";
import { isRedfortsConfigured } from "@/lib/redforts/client";
import { describeError, getInventory, pickLang } from "@/lib/redforts/inventory";
import { resolveSelection } from "@/lib/redforts/pricing";
import { checkoutSchema, guestFieldFormats } from "@/lib/redforts/schemas";
import type { InventoryResponse, ReservationGuest } from "@/lib/redforts/types";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; errors: string[]; fieldErrors?: Record<string, string>; newTotal?: number };

const SITE_LANG = "es";

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

/**
 * Paso de pago: revalida la selección con /availability EN EL SERVIDOR,
 * calcula el importe aquí (nunca se fía del precio del navegador), guarda la
 * reserva pendiente en la base de datos y crea la sesión de Stripe Checkout
 * con el cobro solo autorizado (capture_method: manual). La reserva en
 * Redforts la crea el webhook cuando Stripe confirma la autorización.
 */
export async function startCheckout(input: unknown): Promise<CheckoutResult> {
  if (bookingProvider() !== "redforts") return { ok: false, errors: ["La reserva online no está activa."] };
  if (!isRedfortsConfigured() || !isStripeConfigured() || !isDatabaseConfigured()) {
    console.error("[checkout] falta configuración", {
      redforts: isRedfortsConfigured(),
      stripe: isStripeConfigured(),
      db: isDatabaseConfigured(),
    });
    return { ok: false, errors: ["La reserva online no está disponible ahora mismo. Escríbenos o llámanos."] };
  }

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: parsed.error.issues.map((i) => i.message) };
  const { search, selection, guest: rawGuest, notes, consent, expectedTotal } = parsed.data;

  let inventory: InventoryResponse | null = null;
  try {
    inventory = await getInventory();
    const lang = pickLang(inventory, SITE_LANG);

    const checkedGuest = validateGuest(rawGuest, inventory);
    if ("fieldErrors" in checkedGuest) {
      return { ok: false, errors: ["Revisa los datos marcados."], fieldErrors: checkedGuest.fieldErrors };
    }

    // La única fuente de verdad: disponibilidad y precio recién pedidos a Redforts.
    const availability = await getAvailability({
      arrival: search.arrival,
      departure: search.departure,
      ...(search.promo ? { promo: search.promo } : {}),
    });
    const resolved = resolveSelection(availability, selection, search.adults, search.children);
    if ("error" in resolved) return { ok: false, errors: [resolved.error] };

    const { total } = resolved.breakdown;
    if (Math.abs(total - expectedTotal) > 0.009) {
      return {
        ok: false,
        newTotal: total,
        errors: [`El precio ha cambiado desde tu búsqueda: ahora son ${total.toFixed(2)} €. Revisa la selección y vuelve a confirmar.`],
      };
    }
    const amountCents = Math.round(total * 100);
    if (amountCents <= 0) return { ok: false, errors: ["El importe de la reserva no es válido."] };

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
        customer_email: checkedGuest.guest.email,
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
