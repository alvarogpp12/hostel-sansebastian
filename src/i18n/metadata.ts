import type { Metadata } from "next";
import { getDict } from "@/content/i18n";
import { site } from "@/content/site";
import { alternates, OG_LOCALE, type Locale, type RouteKey } from "./config";

/** Título, descripción, canonical, hreflang y Open Graph de una página en un idioma */
export function pageMetadata(key: RouteKey, locale: Locale): Metadata {
  const d = getDict(locale);
  const { title, description } = key === "home" ? d.site.seo : d.meta[key];
  const alt = alternates(key, locale);
  return {
    // La home lleva el título completo, sin la plantilla «%s · marca»
    title: key === "home" ? { absolute: title } : title,
    description,
    alternates: alt,
    openGraph: {
      type: "website",
      siteName: site.brand.name,
      images: [{ url: "/media/san-sebastian-bahia-la-concha.jpg", width: 2400, height: 1600, alt: "San Sebastián, La Concha" }],
      title,
      description,
      url: alt.canonical,
      locale: OG_LOCALE[locale],
      alternateLocale: Object.values(OG_LOCALE).filter((l) => l !== OG_LOCALE[locale]),
    },
  };
}
