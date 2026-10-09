import type { Metadata } from "next";
import { AutoRefresh } from "@/components/booking/AutoRefresh";
import { ButtonLink } from "@/components/ui";
import { site } from "@/content/site";
import { getBookingBySession, isDatabaseConfigured, type BookingRow } from "@/lib/bookings";

export const metadata: Metadata = {
  title: "Tu reserva",
  robots: { index: false, follow: false },
};

/**
 * Vuelta desde Stripe. Lee el registro que actualiza el webhook: el huésped
 * puede llegar antes de que la reserva esté creada en Redforts, así que
 * mientras esté pendiente la página se refresca sola.
 */
export default async function BookingResultPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id: sessionId } = await searchParams;
  let booking: BookingRow | null = null;
  if (sessionId && /^cs_[A-Za-z0-9_]+$/.test(sessionId) && isDatabaseConfigured()) {
    try {
      booking = await getBookingBySession(sessionId);
    } catch (error) {
      console.error("[confirmada] no se pudo leer la reserva", error);
    }
  }

  const contact = (
    <a className="underline" href={`mailto:${site.contact.email}`}>
      {site.contact.email}
    </a>
  );

  let title = "No encontramos tu reserva";
  let body: React.ReactNode = <p>Si has pagado y no recibes el email de confirmación en unos minutos, escríbenos a {contact}.</p>;
  let refresh = false;

  switch (booking?.status) {
    case "pending":
    case "processing":
      refresh = true;
      title = "Estamos confirmando tu reserva…";
      body = <p>Hemos recibido el pago y estamos cerrando la reserva con el alojamiento. Tarda unos segundos.</p>;
      break;
    case "confirmed":
      title = "¡Reserva confirmada!";
      body = (
        <>
          <p>
            Tu número de reserva es <strong className="font-normal">{booking.reserv_id}</strong>. Te hemos enviado la
            confirmación por email.
          </p>
          {booking.test_mode && <p className="text-sm text-amber-700">Reserva de PRUEBA: no se ha creado en el alojamiento.</p>}
          {booking.guest_url && (
            <p>
              <a className="underline" href={booking.guest_url} target="_blank" rel="noopener noreferrer">
                Ver o gestionar tu reserva
              </a>
            </p>
          )}
        </>
      );
      break;
    case "unconfirmed":
      title = "Reserva recibida";
      body = (
        <p>
          Tu reserva nº <strong className="font-normal">{booking.reserv_id}</strong> está pendiente de que el alojamiento la
          confirme. El pago queda retenido y no se cobra hasta entonces. Te escribiremos en breve.
        </p>
      );
      break;
    case "rejected":
      title = "No se ha podido completar la reserva";
      body = (
        <p>
          La habitación ya no estaba disponible o el precio ha cambiado. <strong className="font-normal">No se te ha
          cobrado nada</strong>: la retención del pago se ha anulado. Vuelve a buscar para ver las opciones actuales.
        </p>
      );
      break;
    case "unknown":
    case "capture_failed":
      title = "Estamos revisando tu reserva";
      body = <p>Ha habido un problema técnico al cerrar la reserva. La revisamos a mano y te escribimos hoy mismo. Si tienes prisa: {contact}.</p>;
      break;
    case "expired":
      title = "El pago no llegó a completarse";
      body = <p>No se ha hecho ningún cargo. Puedes volver a intentarlo cuando quieras.</p>;
      break;
  }

  return (
    <main id="content" className="p-w pt-32">
      {refresh && <AutoRefresh />}
      <div className="mx-auto grid max-w-2xl gap-6 rounded-lg bg-white p-6 lg:p-w lg:py-16">
        <h1 className="style-heading text-2xl lg:text-3xl">{title}</h1>
        <div className="grid gap-4">{body}</div>
        <div className="flex flex-wrap gap-3">
          {booking?.status === "rejected" || booking?.status === "expired" ? (
            <ButtonLink href="/reservar">Volver a buscar</ButtonLink>
          ) : (
            <ButtonLink href="/">Volver al inicio</ButtonLink>
          )}
          {booking?.status === "confirmed" && (
            <ButtonLink href="/mi-reserva" className="!bg-white !text-black ring-1 ring-black">
              Mi reserva
            </ButtonLink>
          )}
        </div>
      </div>
    </main>
  );
}
