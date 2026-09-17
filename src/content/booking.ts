import type { RoomId } from "./rooms";

/**
 * Motor de reservas: Beds24.
 *
 * La web NO gestiona disponibilidad ni cobros. Se encarga de elegir habitación,
 * fechas y personas, y entrega al huésped al motor de Beds24 con todo
 * preseleccionado. Beds24 pone disponibilidad real, channel manager de
 * Booking.com, cobro de la señal (con la cuenta de Stripe del hostal) y el
 * correo de confirmación.
 *
 * ── Qué hay que rellenar aquí cuando exista la cuenta ─────────────────────
 *  1. `propId`: SETTINGS > PROPERTIES > el número de la propiedad.
 *  2. `roomIds`: SETTINGS > PROPERTIES > ROOMS, el id de cada tipo.
 * Mientras `propId` sea null, la web no enlaza al motor: enseña los datos de
 * contacto y explica que la reserva online aún no está activa (nunca un
 * enlace roto ni una confirmación falsa).
 */

export const booking = {
  /** SETTINGS > PROPERTIES en Beds24. PENDIENTE: número real de la propiedad */
  propId: null as number | null,

  /** Nuestro id de habitación → roomid de Beds24. PENDIENTE: ids reales */
  roomIds: {
    individual: null,
    doble: null,
    triple: null,
  } as Record<RoomId, number | null>,

  /** Página de reserva de Beds24 (documentada en su wiki, Embedded Iframe) */
  engineBase: "https://beds24.com/booking2.php",

  /**
   * Formato de fecha de `checkin`/`checkout`.
   *
   * ⚠️ Beds24 documenta los parámetros pero NO el formato de fecha. Se usa
   * ISO (YYYY-MM-DD), que es el que emplea su API v2. Para confirmarlo en un
   * minuto, en cuanto haya cuenta: abre a mano
   *   https://beds24.com/booking2.php?propid=TU_ID&checkin=2027-07-01&checkout=2027-07-03
   * y comprueba que el motor carga con esas fechas puestas. Si no las coge,
   * prueba "DD/MM/YYYY" cambiando solo esta línea.
   */
  dateFormat: "YYYY-MM-DD" as "YYYY-MM-DD" | "DD/MM/YYYY",

  /** Se añade a la URL para poder medir en Beds24 cuántas reservas trae la web */
  referer: "web",

  /* ── Cobro con Stripe ────────────────────────────────────────────────── */

  currency: "eur",

  /**
   * Señal que se cobra al reservar. El resto se paga en el hostal.
   * - "first-night": el precio de la primera noche (lo recomendado).
   * - "percent": un porcentaje del total, en `depositPercent`.
   * - "full": el importe completo.
   */
  depositType: "first-night" as "first-night" | "percent" | "full",
  depositPercent: 30,

  /**
   * Cómo se cobra:
   * - "manual" (recomendado): se retiene el importe, se comprueba en Beds24 que
   *   la habitación sigue libre y solo entonces se cobra de verdad. Evita cobrar
   *   por una cama que acaba de venderse en Booking. Inconveniente: Stripe no
   *   admite Bizum con retención, así que con "manual" solo hay tarjeta.
   * - "automatic": cobra al momento y permite Bizum, pero si la habitación ya no
   *   está hay que devolver el dinero (y Stripe no devuelve su comisión).
   */
  captureMethod: "manual" as "manual" | "automatic",
};

/** Importe de la señal en euros, a partir del precio por noche y las noches */
export function depositAmount(pricePerNight: number, nights: number): number {
  const total = pricePerNight * nights;
  if (booking.depositType === "full") return total;
  if (booking.depositType === "percent") return Math.round((total * booking.depositPercent) / 100);
  return pricePerNight;
}

export const isEngineConfigured = () => booking.propId !== null;

const formatDate = (iso: string) => {
  if (booking.dateFormat === "YYYY-MM-DD") return iso;
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

export type BookingSelection = {
  room: RoomId;
  /** Fechas en ISO (YYYY-MM-DD), tal y como las da un <input type="date"> */
  checkIn: string;
  checkOut: string;
  adults: number;
};

/**
 * Construye el enlace al motor con la reserva preseleccionada.
 * Devuelve null si el motor todavía no está configurado.
 */
export function buildEngineUrl({ room, checkIn, checkOut, adults }: BookingSelection): string | null {
  if (booking.propId === null) return null;

  const params = new URLSearchParams({
    propid: String(booking.propId),
    checkin: formatDate(checkIn),
    checkout: formatDate(checkOut),
    numadult: String(adults),
    referer: booking.referer,
  });

  // Si conocemos el id de la habitación, el motor abre directamente en ella.
  const roomId = booking.roomIds[room];
  if (roomId !== null) params.set("roomid", String(roomId));

  return `${booking.engineBase}?${params.toString()}`;
}
