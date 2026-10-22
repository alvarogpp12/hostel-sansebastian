"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * Un único listener para saber dónde hace clic la gente. Cuenta:
 *  - Todos los enlaces, clasificados por destino (Reservar, WhatsApp, Teléfono,
 *    Email, Google Maps, redes, páginas internas…).
 *  - Los botones con `data-evento="…"` (p. ej. «Ver fotos»).
 * La zona sale de `data-zona` del elemento o de un antepasado; si no hay, de
 * dónde está (cabecera, pie, galería o página).
 */
function whatIs(el: HTMLElement): string | null {
  if (el.dataset.evento) return el.dataset.evento;
  if (!(el instanceof HTMLAnchorElement)) return null;
  const href = el.getAttribute("href") ?? "";
  if (href.startsWith("tel:")) return "Teléfono";
  if (href.startsWith("mailto:")) return "Email";
  if (/wa\.me|whatsapp/i.test(href)) return "WhatsApp";
  if (href.startsWith("#")) return `Ancla ${href}`;
  let url: URL;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return null;
  }
  if (url.origin === window.location.origin) return url.pathname.startsWith("/reservar") ? "Reservar" : `Página ${url.pathname}`;
  if (/google\.[a-z.]+\/maps|maps\.google|goo\.gl\/maps/.test(url.href)) return "Google Maps";
  return `Externo ${url.hostname.replace(/^www\./, "")}`;
}

function zoneOf(el: HTMLElement): string {
  const marked = el.closest<HTMLElement>("[data-zona]");
  if (marked?.dataset.zona) return marked.dataset.zona;
  if (el.closest("header")) return "cabecera";
  if (el.closest("footer")) return "pie";
  if (el.closest('[role="dialog"]')) return "galería";
  return "página";
}

export function ClickTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("a[href], [data-evento]");
      if (!el) return;
      const que = whatIs(el);
      if (que) trackEvent("Clic", { que: que.slice(0, 100), zona: zoneOf(el) });
    };
    // En captura: se cuenta aunque el enlace navegue o pare la propagación
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
