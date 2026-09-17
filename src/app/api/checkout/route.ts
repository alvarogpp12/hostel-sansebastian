import { booking, depositAmount } from "@/content/booking";
import { rooms, type RoomId } from "@/content/rooms";
import { site } from "@/content/site";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

/**
 * Crea la sesión de pago de la señal y devuelve la URL de Stripe Checkout.
 *
 * ⚠️ Esto SOLO cobra. La reserva se crea en Beds24 después, desde el webhook
 * (`/api/stripe/webhook`), una vez comprobado que la habitación sigue libre.
 * Mientras no haya precios ni cuenta de Beds24, la ruta responde 503 y la web
 * enseña el aviso de "reserva online todavía no disponible".
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

type Payload = {
  habitacion: RoomId;
  entrada: string;
  salida: string;
  personas: number;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
};

function validate(data: Partial<Payload>): { ok: true; value: Payload } | { ok: false; message: string } {
  const room = rooms.find((r) => r.id === data.habitacion);
  if (!room) return { ok: false, message: "Tipo de habitación no válido." };

  const { entrada, salida } = data;
  if (!entrada || !salida || !ISO_DATE.test(entrada) || !ISO_DATE.test(salida)) {
    return { ok: false, message: "Fechas no válidas." };
  }
  if (salida <= entrada) return { ok: false, message: "La fecha de salida debe ser posterior a la de entrada." };
  if (entrada < new Date().toISOString().slice(0, 10)) return { ok: false, message: "La fecha de entrada ya ha pasado." };

  const personas = Number(data.personas);
  if (!Number.isInteger(personas) || personas < 1 || personas > room.guests) {
    return { ok: false, message: `Esa habitación admite como máximo ${room.guests} personas.` };
  }

  for (const field of ["nombre", "apellidos", "email", "telefono"] as const) {
    if (!data[field]?.trim()) return { ok: false, message: "Faltan datos de la reserva." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email!)) return { ok: false, message: "El email no es válido." };

  return { ok: true, value: { ...(data as Payload), personas } };
}

const nightsBetween = (from: string, to: string) =>
  Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000);

export async function POST(request: Request) {
  if (!isStripeConfigured() || booking.propId === null) {
    return Response.json(
      { message: "La reserva online todavía no está activa. Escríbenos y te confirmamos disponibilidad." },
      { status: 503 },
    );
  }

  const result = validate(await request.json().catch(() => ({})));
  if (!result.ok) return Response.json({ message: result.message }, { status: 400 });

  const { habitacion, entrada, salida, personas, nombre, apellidos, email, telefono } = result.value;
  const room = rooms.find((r) => r.id === habitacion)!;

  // Sin precio confirmado no se puede cobrar nada.
  if (room.priceFrom === null) {
    return Response.json({ message: "Todavía no hay tarifas publicadas para esta habitación." }, { status: 503 });
  }

  const nights = nightsBetween(entrada, salida);
  const deposit = depositAmount(room.priceFrom, nights);

  try {
    const stripe = getStripe();
    const origin = new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        locale: "es",
        customer_email: email,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: booking.currency,
              unit_amount: deposit * 100, // Stripe trabaja en céntimos
              product_data: {
                name: `${room.name} · ${site.brand.name}`,
                description: `${entrada} → ${salida} · ${nights} ${nights === 1 ? "noche" : "noches"} · ${personas} ${
                  personas === 1 ? "persona" : "personas"
                }`,
              },
            },
          },
        ],
        payment_intent_data: {
          capture_method: booking.captureMethod,
          description: `Señal de reserva · ${room.name}`,
        },
        // Lo que el webhook necesita para crear la reserva en Beds24.
        metadata: { habitacion, entrada, salida, personas: String(personas), nombre, apellidos, telefono },
        success_url: `${origin}/reservar/confirmada?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/reservar?habitacion=${habitacion}`,
      },
      // Evita cobrar dos veces si el visitante pulsa el botón repetidamente.
      { idempotencyKey: `${email}:${habitacion}:${entrada}:${salida}:${personas}` },
    );

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("[checkout] no se pudo crear la sesión de pago", error);
    return Response.json({ message: "No se pudo iniciar el pago. Inténtalo de nuevo en unos minutos." }, { status: 502 });
  }
}
