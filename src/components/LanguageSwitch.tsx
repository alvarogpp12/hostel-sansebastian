"use client";

import { usePathname } from "next/navigation";
import { getDict } from "@/content/i18n";
import { LOCALE_NAME, LOCALES, localeFromPath, ROUTES, routeKeyFromPath } from "@/i18n/config";

/**
 * ES · EN · FR. Cada idioma enlaza a la misma página en ese idioma; desde una
 * página que solo existe en español (textos legales…), a su portada.
 * Enlaces normales (<a>): cambiar de idioma recarga la página entera.
 */
export function LanguageSwitch({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const current = localeFromPath(pathname);
  const key = routeKeyFromPath(pathname);
  return (
    <ul aria-label={getDict(current).site.ui.language} className={`flex items-center gap-1 ${className}`}>
      {LOCALES.map((l) => {
        const href = ROUTES[key ?? "home"][l];
        return (
          <li key={l}>
            <a
              href={href}
              hrefLang={l}
              lang={l}
              aria-current={l === current ? "true" : undefined}
              title={LOCALE_NAME[l]}
              className={`rounded-full px-2 py-1 uppercase transition-colors ${l === current ? "bg-white text-black" : "hover:text-white"}`}
            >
              {l}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
