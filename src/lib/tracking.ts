/**
 * Medición de marketing: Google Analytics 4 (también sirve a Google Ads) y el
 * píxel de Meta. Solo se cargan con el consentimiento «Analítica y publicidad»
 * (ver src/lib/consent.ts y src/components/Tracking.tsx).
 *
 * Los IDs no son secretos (van en el HTML de cualquier web). Se pueden cambiar
 * con variables de Vercel sin tocar código.
 */
export const tracking = {
  /** GA4 · propiedad «enjoycomfort.com», flujo «Enjoy Comfort web» */
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID ?? "G-BF1SH9V0R0",
  /** Píxel de Meta · conjunto de datos «Enjoy Comfort web» del portfolio Enjoy comfort */
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "1846071030041787",
};

type Gtag = (...args: unknown[]) => void;
type Fbq = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
    fbq?: Fbq;
  }
}

/** Evento de GA4 (nombres recomendados de Google para que Ads los entienda) */
export function gaEvent(name: string, params: Record<string, unknown> = {}) {
  try {
    window.gtag?.("event", name, params);
  } catch {
    // La medición nunca debe romper la web
  }
}

/** Evento estándar del píxel de Meta */
export function metaEvent(name: string, params: Record<string, unknown> = {}, eventID?: string) {
  try {
    window.fbq?.("track", name, params, eventID ? { eventID } : undefined);
  } catch {
    // La medición nunca debe romper la web
  }
}
