/**
 * La búsqueda de la home viaja a /reservar en la URL
 * (/reservar?llegada=2026-10-16&salida=2026-10-18&adultos=2), para que la
 * página de reserva abra con las fechas puestas y consulte la disponibilidad
 * sin pedir nada más. También sirve para enlazar desde fuera (campañas, emails).
 */

export const SEARCH_PARAMS = {
  arrival: "llegada",
  departure: "salida",
  adults: "adultos",
  room: "habitacion",
} as const;

export const MAX_ADULTS = 8;

export type BookingSearch = {
  arrival: string | null;
  departure: string | null;
  adults: number | null;
  room: string | null;
};

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/** YYYY-MM-DD real (descarta 2026-02-31 y similares) */
export function isIsoDay(value: string | null | undefined): value is string {
  if (!value || !ISO_DAY.test(value)) return false;
  const t = Date.parse(`${value}T00:00:00Z`);
  return !Number.isNaN(t) && new Date(t).toISOString().slice(0, 10) === value;
}

export function addDays(iso: string, n: number): string {
  return new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
}

export function nightsBetween(arrival: string, departure: string): number {
  return Math.round((Date.parse(`${departure}T00:00:00Z`) - Date.parse(`${arrival}T00:00:00Z`)) / 86_400_000);
}

/** Hoy en la zona horaria del navegador, en YYYY-MM-DD */
export function localToday(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * Lee la búsqueda de la URL. Lo que no es válido se ignora en vez de dar
 * error: una llegada pasada o una salida anterior a la llegada se quedan en
 * null y el huésped las elige en el calendario.
 */
export function parseBookingSearch(get: (key: string) => string | null, today: string): BookingSearch {
  const rawArrival = get(SEARCH_PARAMS.arrival);
  const arrival = isIsoDay(rawArrival) && rawArrival >= today ? rawArrival : null;

  const rawDeparture = get(SEARCH_PARAMS.departure);
  const departure = arrival && isIsoDay(rawDeparture) && rawDeparture > arrival ? rawDeparture : null;

  const n = Number(get(SEARCH_PARAMS.adults));
  const adults = Number.isInteger(n) && n >= 1 && n <= MAX_ADULTS ? n : null;

  const room = get(SEARCH_PARAMS.room)?.trim() || null;

  return { arrival, departure, adults, room };
}

export function bookingHref(search: Partial<BookingSearch> = {}): string {
  const params = new URLSearchParams();
  if (search.arrival) params.set(SEARCH_PARAMS.arrival, search.arrival);
  if (search.departure) params.set(SEARCH_PARAMS.departure, search.departure);
  if (search.adults) params.set(SEARCH_PARAMS.adults, String(search.adults));
  if (search.room) params.set(SEARCH_PARAMS.room, search.room);
  const qs = params.toString();
  return qs ? `/reservar?${qs}` : "/reservar";
}
