import type { RoomId } from "./rooms";

/**
 * Motor de reservas: Redforts.
 *
 * La web NO gestiona disponibilidad, precios ni cobros. Se encarga de elegir
 * habitación y fechas, y abre el motor de Redforts incrustado en /reservar con
 * todo preseleccionado. Redforts pone la disponibilidad real, el channel
 * manager (Booking.com y demás), el cobro y el correo de confirmación.
 *
 * El enlace es el mismo que usa el plugin oficial de Redforts para WordPress
 * (Oscar Hotel Booking Engine):
 *   https://booking.redforts.com/{idioma}/iframe/{beCode}/?arrival=…&departure=…&acco=…
 *
 * ── Qué hay que rellenar aquí cuando exista la cuenta ─────────────────────
 *  1. `beCode`: el código del motor de reservas. Está en Redforts, en
 *     Configuración > Motor de reservas > Integración (oscar.redforts.com/es/setup,be,integration):
 *     es la parte del enlace del motor que va después de `/iframe/`.
 *  2. `accoIds`: el id de cada tipo de alojamiento en Redforts, para que el
 *     motor abra directamente en la habitación elegida. Si alguno se queda en
 *     null, el motor abre con todas las habitaciones disponibles.
 * Mientras `beCode` sea null, la web no enlaza al motor: enseña los datos de
 * contacto y explica que la reserva online aún no está activa (nunca un
 * enlace roto ni una confirmación falsa).
 */

export const booking = {
  /** PENDIENTE: código del motor de reservas de Redforts */
  beCode: null as string | null,

  /** Nuestro id de habitación → id de alojamiento ("acco") en Redforts. PENDIENTE */
  accoIds: {
    doble: null,
    "dos-camas": null,
    "doble-privado": null,
    familiar: null,
  } as Record<RoomId, string | null>,

  /** Idioma del motor (tiene que estar activado en la cuenta de Redforts) */
  lang: "es",

  host: "booking.redforts.com",
};

export const engineOrigin = `https://${booking.host}`;

export const isEngineConfigured = () => booking.beCode !== null;

export type BookingSelection = {
  room: RoomId;
  /** Fechas en ISO (YYYY-MM-DD), tal y como las da un <input type="date"> */
  checkIn: string;
  checkOut: string;
};

/**
 * Construye la URL del motor de Redforts con la reserva preseleccionada.
 * Devuelve null si el motor todavía no está configurado.
 */
export function buildEngineUrl({ room, checkIn, checkOut }: BookingSelection): string | null {
  if (booking.beCode === null) return null;

  const params = new URLSearchParams({ arrival: checkIn, departure: checkOut });

  // Si conocemos el id del alojamiento, el motor abre directamente en él.
  const acco = booking.accoIds[room];
  if (acco !== null) params.set("acco", acco);

  return `${engineOrigin}/${booking.lang}/iframe/${encodeURIComponent(booking.beCode)}/?${params.toString()}`;
}

/**
 * Qué flujo de reserva usa la web (solo servidor):
 * - "legacy" (por defecto): el motor de Redforts incrustado en un iframe.
 * - "redforts": reserva nativa con la Booking API v5 y pago con Stripe.
 */
export type BookingProvider = "legacy" | "redforts";
export function bookingProvider(): BookingProvider {
  return process.env.BOOKING_PROVIDER === "redforts" ? "redforts" : "legacy";
}
