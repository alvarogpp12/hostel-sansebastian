"use client";

import { track } from "@vercel/analytics";

/**
 * Eventos de Vercel Web Analytics (proyecto › Analytics › Events). La ruta en
 * la que pasan la guarda Vercel sola. Reglas:
 *  - Como mucho 2 propiedades por evento (lo que admite el plan Pro).
 *  - Nada de datos personales: ni nombres, ni emails, ni teléfonos.
 * Los de la reserva confirmada/rechazada salen del servidor (webhook de Stripe).
 */
export type AnalyticsEvents = {
  /** Clic en un enlace o botón marcado: qué es y en qué parte de la página */
  Clic: { que: string; zona: string };
  "Reserva · búsqueda": { noches: number; personas: number };
  "Reserva · sin disponibilidad": { noches: number; personas: number };
  "Reserva · fechas no disponibles": { motivo: "llegada" | "estancia" | "llegada y estancia"; noches: number };
  "Reserva · error": { paso: "búsqueda" | "pago"; motivo: string };
  "Reserva · habitación elegida": { habitacion: string; noches: number };
  /** Con checkoutMode "whatsapp", la solicitud enviada es la venta */
  "Reserva · solicitud por WhatsApp": { habitacion: string; importe: number };
  "Reserva · pago iniciado": { habitacion: string; importe: number };
  "Reserva · pago cancelado": Record<string, never>;
  Newsletter: { resultado: "alta" | "error" };
  Cookies: { decision: "aceptar" | "rechazar" | "guardar" | "ver mapa"; terceros: boolean };
};

export function trackEvent<K extends keyof AnalyticsEvents>(name: K, data?: AnalyticsEvents[K]) {
  try {
    track(name, data);
  } catch {
    // Las estadísticas nunca deben romper la web
  }
}
