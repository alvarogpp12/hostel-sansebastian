"use client";

import { usePathname } from "next/navigation";
import { localeFromPath, type Locale } from "./config";

/** Idioma de la página actual (por la ruta: /en…, /fr… o español) */
export function useLocale(): Locale {
  return localeFromPath(usePathname());
}
