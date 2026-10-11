import type Stripe from "stripe";
import { claimBooking, expireBooking, getBooking, updateBooking, type BookingRow } from "@/lib/bookings";
import { createReservation } from "@/lib/redforts/api";
import { RedfortsError } from "@/lib/redforts/client";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Webhook de Stripe: autorizar → reservar en Redforts → capturar.
 *
 *   1. `checkout.session.completed`: el pago está AUTORIZADO, no cobrado.
 *   2. Se reclama la reserva en la base de datos (pending → processing, en un
 *      UPDATE atómico). Si el evento llega dos veces, el segundo no reclama
 *      nada y no se crea una segunda reserva.
 *   3. /reservation con status "confirmed" e ignore_prepayment.
 *   4. Confirmada → se captura el cobro. Rechazada (300, 301…) → se anula la
 *      autorización y el huésped no paga nada.
 *   5. Fallo de red o timeout al reservar → NO se reintenta (podría duplicar
 *      la reserva) y NO se toca el pago: queda en estado "unknown" para
 *      revisarlo a mano antes de que caduque la autorización (7 días).
 *
 * Firma: STRIPE_WEBHOOK_SECRET. En local:
 *   stripe listen --forward-to localhost:3000/api/stripe/webhook
 */

const euros = (cents: number, currency: string) => `${(cents / 100).toFixed(2)} ${currency === "EUR" ? "€" : currency}`;

async function processPaidSession(session: Stripe.Checkout.Session): Promise<void> {
  const bookingId = session.metadata?.booking_id;
  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  if (!bookingId || !paymentIntentId) {
    console.warn("[webhook] sesión sin booking_id o sin payment_intent, se ignora", session.id);
    return;
  }

  const stripe = getStripe();
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (intent.status !== "requires_capture") {
    console.warn("[webhook] el pago no está pendiente de captura, no se reserva", { bookingId, status: intent.status });
    return;
  }

  const booking = await claimBooking(bookingId, paymentIntentId);
  if (!booking) {
    console.info("[webhook] evento duplicado o reserva ya procesada, se ignora", { bookingId });
    return;
  }

  await reserveAndCapture(booking, paymentIntentId);
}

async function reserveAndCapture(booking: BookingRow, paymentIntentId: string): Promise<void> {
  const stripe = getStripe();
  const { guest_notes: guestNotes, ...request } = booking.request;
  const notes = [`Pagado Stripe ${paymentIntentId} ${euros(booking.amount_cents, booking.currency)}`, guestNotes]
    .filter(Boolean)
    .join("\n");

  let result;
  try {
    result = await createReservation({ ...request, status: "confirmed", ignore_prepayment: true, notes });
  } catch (error) {
    if (error instanceof RedfortsError && error.kind === "api") {
      // Redforts la ha rechazado (sin disponibilidad, precio cambiado…): no se cobra.
      await stripe.paymentIntents.cancel(paymentIntentId, {}, { idempotencyKey: `cancel-${booking.id}` });
      await updateBooking(booking.id, { status: "rejected", errors: error.errors });
      console.warn("[webhook] Redforts rechazó la reserva; autorización anulada", { id: booking.id, codes: error.codes });
      return;
    }
    // No sabemos si la reserva se ha creado: nada de reintentos ni de tocar el pago.
    await updateBooking(booking.id, {
      status: "unknown",
      errors: [{ code: 0, text: error instanceof Error ? error.message : String(error) }],
    });
    console.error(
      `[webhook] 🚨 REVISAR A MANO: resultado desconocido al crear la reserva ${booking.id} (pago ${paymentIntentId} retenido sin capturar)`,
    );
    return;
  }

  if (result.status === "confirmed") {
    try {
      await stripe.paymentIntents.capture(paymentIntentId, {}, { idempotencyKey: `capture-${booking.id}` });
      await updateBooking(booking.id, { status: "confirmed", reserv_id: result.id ?? null, guest_url: result.url ?? null });
      console.info("[webhook] reserva confirmada y cobrada", { id: booking.id, reserv_id: result.id });
    } catch (error) {
      await updateBooking(booking.id, { status: "capture_failed", reserv_id: result.id ?? null, guest_url: result.url ?? null });
      console.error(`[webhook] 🚨 REVISAR A MANO: reserva ${result.id} creada pero no se pudo cobrar`, error);
    }
    return;
  }

  // "unconfirmed": la recibieron pero la tiene que aceptar el personal.
  // REDFORTS-DUDA: ¿se cobra igual? De momento se deja el pago retenido (7 días).
  await updateBooking(booking.id, { status: "unconfirmed", reserv_id: result.id ?? null, guest_url: result.url ?? null });
  console.warn(`[webhook] reserva ${result.id} SIN CONFIRMAR por el hotel: pago ${paymentIntentId} retenido, revisar`);
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) {
    return Response.json({ message: "Webhook no configurado." }, { status: 503 });
  }

  // La firma se valida contra el cuerpo SIN parsear: no usar request.json().
  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.error("[webhook] firma no válida", error);
    return Response.json({ message: "Firma no válida." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await processPaidSession(event.data.object);
        break;
      case "checkout.session.expired": {
        const id = event.data.object.metadata?.booking_id;
        if (id && (await getBooking(id))) await expireBooking(id);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    // Un 500 hace que Stripe reintente; es seguro porque reclamar la reserva es idempotente.
    console.error("[webhook] error procesando el evento", event.type, error);
    return Response.json({ message: "Error procesando el evento." }, { status: 500 });
  }

  return Response.json({ received: true });
}
