import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { LOCALES, ROUTES, type RouteKey } from "@/i18n/config";

/** Páginas que solo existen en español */
const SPANISH_ONLY = ["/privacidad", "/terminos", "/aviso-legal", "/cookies"];

const PRIORITY: Record<RouteKey, number> = { home: 1, rooms: 0.8, book: 0.8, location: 0.6, practical: 0.5 };

/**
 * Cada página en sus tres idiomas, con las alternativas hreflang para que
 * Google enseñe a cada visitante la versión de su idioma.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const abs = (p: string) => `${site.url}${p === "/" ? "/" : p}`;
  const translated = (Object.keys(ROUTES) as RouteKey[]).flatMap((key) =>
    LOCALES.map((locale) => ({
      url: abs(ROUTES[key][locale]),
      lastModified: now,
      changeFrequency: key === "home" ? ("weekly" as const) : ("monthly" as const),
      priority: locale === "es" ? PRIORITY[key] : Math.max(0.4, PRIORITY[key] - 0.1),
      alternates: { languages: Object.fromEntries([...LOCALES.map((l) => [l, abs(ROUTES[key][l])]), ["x-default", abs(ROUTES[key].es)]]) },
    })),
  );
  const legal = SPANISH_ONLY.map((p) => ({ url: abs(p), lastModified: now, changeFrequency: "yearly" as const, priority: 0.2 }));
  return [...translated, ...legal];
}
