/**
 * Mensaje de solicitud de reserva por WhatsApp: todo lo que el huésped ha
 * elegido y rellenado, listo para enviar al alojamiento.
 *
 * Sin emojis: el enlace wa.me redirige a api.whatsapp.com y en esa redirección
 * los emojis llegan rotos (�). Las viñetas «•» sí llegan bien.
 */

export type WhatsAppBookingRequest = {
  arrival: string;
  departure: string;
  adults: number;
  children: number;
  rooms: { name: string; rate?: string; quantity: number; price?: string }[];
  total?: string;
  promo?: string;
  /** Datos del huésped ya etiquetados, en el orden en que se muestran */
  guest: { label: string; value: string }[];
  notes?: string;
};

const longDate = new Intl.DateTimeFormat("es-ES", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const fmt = (iso: string) => longDate.format(new Date(`${iso}T00:00:00Z`));
const nights = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

export function bookingRequestMessage(r: WhatsAppBookingRequest): string {
  const n = nights(r.arrival, r.departure);
  const people = [`${r.adults} ${r.adults === 1 ? "adulto" : "adultos"}`, r.children ? `${r.children} ${r.children === 1 ? "niño" : "niños"}` : ""]
    .filter(Boolean)
    .join(" y ");

  const lines = [
    "Hola, quiero solicitar esta reserva en Enjoy Comfort:",
    "",
    ...r.rooms.map((room) => `• Habitación: ${room.quantity} × ${room.name}${room.rate ? ` (${room.rate})` : ""}${room.price ? ` · ${room.price}` : ""}`),
    `• Llegada: ${fmt(r.arrival)}`,
    `• Salida: ${fmt(r.departure)} (${n} ${n === 1 ? "noche" : "noches"})`,
    `• Personas: ${people}`,
    ...(r.total ? [`• Precio que me sale en la web: ${r.total}`] : []),
    ...(r.promo ? [`• Código promocional: ${r.promo}`] : []),
    "",
    "Mis datos:",
    ...r.guest.filter((g) => g.value.trim()).map((g) => `• ${g.label}: ${g.value.trim()}`),
    ...(r.notes?.trim() ? ["", `Comentarios: ${r.notes.trim()}`] : []),
    "",
    "¿Me confirmáis la disponibilidad? Gracias.",
  ];
  return lines.join("\n");
}

export function whatsAppUrl(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
