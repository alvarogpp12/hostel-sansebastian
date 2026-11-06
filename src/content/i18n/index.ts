import type { Locale } from "@/i18n/config";
import { rooms as baseRooms, type Room } from "../rooms";
import { en } from "./en";
import { es, type Dict } from "./es";
import { fr } from "./fr";

export type { Dict };

const DICTS: Record<Locale, Dict> = { es, en, fr };

export const getDict = (locale: Locale): Dict => DICTS[locale] ?? es;

/** Habitaciones con los textos del idioma (fotos, precios e ids son los mismos) */
export function getRooms(locale: Locale): Room[] {
  const t = getDict(locale).rooms;
  return baseRooms.map((r) => ({
    ...r,
    name: t[r.id].name,
    short: t[r.id].short,
    meta: t[r.id].meta,
    cardText: t[r.id].cardText,
    text: t[r.id].text,
    specs: r.specs.map((s, i) => ({ ...s, text: t[r.id].specs[i] ?? s.text })),
  }));
}

const INTL: Record<Locale, string> = { es: "es-ES", en: "en-GB", fr: "fr-FR" };

/** 108 → «108 €»; 49.5 → «49,50 €» (o «€49.50» en inglés) */
export function formatEuros(n: number, locale: Locale) {
  return new Intl.NumberFormat(INTL[locale], { style: "currency", currency: "EUR", minimumFractionDigits: Number.isInteger(n) ? 0 : 2 }).format(n);
}

export function priceLabelFor(room: Room, locale: Locale) {
  const ui = getDict(locale).site.ui;
  return room.priceFrom === null ? ui.consultPrice : `${ui.from} ${formatEuros(room.priceFrom, locale)}`;
}
