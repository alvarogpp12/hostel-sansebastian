/**
 * Idiomas de la web. El español va en la raíz (/, /habitaciones…) y el inglés
 * y el francés con prefijo y rutas traducidas (/en/rooms, /fr/chambres…).
 *
 * Los textos legales (aviso legal, privacidad, cookies, términos), la página
 * de «mi reserva» y la de confirmación solo existen en español.
 */
export const LOCALES = ["es", "en", "fr"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "es";

export type RouteKey = "home" | "rooms" | "location" | "practical" | "book";

export const ROUTES: Record<RouteKey, Record<Locale, string>> = {
  home: { es: "/", en: "/en", fr: "/fr" },
  rooms: { es: "/habitaciones", en: "/en/rooms", fr: "/fr/chambres" },
  location: { es: "/ubicacion", en: "/en/location", fr: "/fr/emplacement" },
  practical: { es: "/info-practica", en: "/en/practical-information", fr: "/fr/informations-pratiques" },
  book: { es: "/reservar", en: "/en/book", fr: "/fr/reserver" },
};

/** Para Intl (fechas y precios) */
export const INTL_LOCALE: Record<Locale, string> = { es: "es-ES", en: "en-GB", fr: "fr-FR" };
/** Open Graph */
export const OG_LOCALE: Record<Locale, string> = { es: "es_ES", en: "en_GB", fr: "fr_FR" };
/** Nombre del idioma en su propio idioma (selector) */
export const LOCALE_NAME: Record<Locale, string> = { es: "Español", en: "English", fr: "Français" };

export function localeFromPath(pathname: string | null | undefined): Locale {
  const p = pathname ?? "/";
  if (p === "/en" || p.startsWith("/en/")) return "en";
  if (p === "/fr" || p.startsWith("/fr/")) return "fr";
  return "es";
}

/** Qué página es (sin idioma), para enlazar su versión en otro idioma */
export function routeKeyFromPath(pathname: string | null | undefined): RouteKey | null {
  const p = (pathname ?? "/").replace(/\/$/, "") || "/";
  for (const [key, paths] of Object.entries(ROUTES) as [RouteKey, Record<Locale, string>][]) {
    if (Object.values(paths).includes(p)) return key;
  }
  return null;
}

export const path = (locale: Locale, key: RouteKey) => ROUTES[key][locale];

/** canonical + hreflang de una página en un idioma */
export function alternates(key: RouteKey, locale: Locale) {
  const r = ROUTES[key];
  return {
    canonical: r[locale],
    languages: { es: r.es, en: r.en, fr: r.fr, "x-default": r.es },
  };
}
