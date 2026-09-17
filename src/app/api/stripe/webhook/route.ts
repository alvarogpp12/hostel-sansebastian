import type Stripe from "stripe";
import { booking } from "@/content/booking";
import { getStripe } from "@/lib/stripe";

/**
 * Webhook de Stripe: es aquí donde una reserva se convierte en reserva de verdad.
 *
 * Orden de las cosas, y el orden importa:
 *   1. Stripe avisa de que el pago se ha autorizado (retenido, no cobrado).
 *   2. Se comprueba en Beds24 que la habitación SIGUE libre. Entre que el
 *      huésped rellenó el formulario y pagó pueden haber pasado minutos, y en
 *      ese hueco Booking.com puede haber vendido la última cama.
 *   3. Si sigue libre: se crea la reserva en Beds24 y se cobra de verdad.
 *      Si ya no: se anula la retención, el huésped no paga nada y se le avisa.
 *
 * ⚠️ PENDIENTE (necesita cuenta de Beds24 para poder probarse):
 * los pasos 2 y 3 están marcados abajo con TODO. Hasta entonces esta ruta
 * registra el evento y responde 200, y la web no ofrece pagar (ver
 * `/api/checkout`, que responde 503 mientras `booking.propId` sea null).
 *
 * Firma del webhook: STRIPE_WEBHOOK_SECRET. En local:
 *   stripe listen --forward-to localhost:3000/api/stripe/webhook
 */

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
      case "checkout.session.completed": {
        const session = event.data.object;
        const data = session.metadata ?? {};
        console.info("[webhook] pago autorizado", {
          sessionId: session.id,
          habitacion: data.habitacion,
          entrada: data.entrada,
          salida: data.salida,
          personas: data.personas,
          importe: session.amount_total,
        });

        // TODO(beds24): 1) GET /inventory/rooms/availability para esas fechas.
        // TODO(beds24): 2) si hay hueco -> POST /bookings con los datos de
        //   `data` y el id de la sesión de Stripe como referencia (para que no
        //   se dupliquen si Stripe reintenta el webhook).
        // TODO(stripe):  3) si la reserva se creó y captureMethod es "manual",
        //   stripe.paymentIntents.capture(session.payment_intent).
        // TODO(stripe):  4) si NO hay hueco, cancelar la retención con
        //   stripe.paymentIntents.cancel(...) y avisar al huésped por email.
        if (booking.captureMethod === "manual") {
          console.warn("[webhook] pago retenido y SIN capturar: falta conectar Beds24 antes de cobrar.");
        }
        break;
      }

      case "checkout.session.expired":
        console.info("[webhook] sesión de pago caducada", event.data.object.id);
        break;

      default:
        break;
    }
  } catch (error) {
    // Un 500 hace que Stripe reintente, que es lo que queremos ante un fallo
    // temporal. Por eso el manejador debe ser idempotente.
    console.error("[webhook] error procesando el evento", event.type, error);
    return Response.json({ message: "Error procesando el evento." }, { status: 500 });
  }

  return Response.json({ received: true });
}
