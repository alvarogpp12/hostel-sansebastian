"use client";

import { track } from "@vercel/analytics";
import { gaEvent, metaEvent } from "@/lib/tracking";

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
  forwardToAds(name, data);
}

/**
 * El mismo evento, traducido a los nombres estándar de GA4/Google Ads y del
 * píxel de Meta (solo llega si hay consentimiento: sin él no existen gtag ni
 * fbq). Conversiones:
 *  - Venta: «Reserva · solicitud por WhatsApp» (modo whatsapp) y
 *    «Reserva · pago iniciado» (modo tpv; la confirmación del pago la manda
 *    el servidor).
 *  - Contacto directo: clic en WhatsApp, teléfono o email.
 */
function forwardToAds<K extends keyof AnalyticsEvents>(name: K, data?: AnalyticsEvents[K]) {
  const d = (data ?? {}) as Record<string, unknown>;
  switch (name) {
    case "Reserva · búsqueda":
      gaEvent("search", { search_term: `${d.noches} noches · ${d.personas} personas`, nights: d.noches, guests: d.personas });
      metaEvent("Search", { search_string: `${d.noches} noches · ${d.personas} personas` });
      break;
    case "Reserva · habitación elegida":
      gaEvent("select_item", { items: [{ item_id: d.habitacion, item_name: d.habitacion }], nights: d.noches });
      metaEvent("ViewContent", { content_name: d.habitacion, content_type: "hotel" });
      break;
    case "Reserva · solicitud por WhatsApp":
      gaEvent("generate_lead", { currency: "EUR", value: d.importe, lead_source: "whatsapp", room: d.habitacion });
      metaEvent("Lead", { currency: "EUR", value: d.importe, content_name: d.habitacion });
      break;
    case "Reserva · pago iniciado":
      gaEvent("begin_checkout", { currency: "EUR", value: d.importe, items: [{ item_id: d.habitacion, item_name: d.habitacion }] });
      metaEvent("InitiateCheckout", { currency: "EUR", value: d.importe, content_name: d.habitacion });
      break;
    case "Clic": {
      const que = String(d.que ?? "");
      if (que === "WhatsApp" || que === "Teléfono" || que === "Email") {
        gaEvent("contact", { method: que, zone: d.zona });
        metaEvent("Contact", { content_name: que });
      } else if (que === "Reservar") {
        gaEvent("booking_cta", { zone: d.zona });
      }
      break;
    }
  }
}
