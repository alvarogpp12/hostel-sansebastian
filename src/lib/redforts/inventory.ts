import "server-only";
import { revalidateTag } from "next/cache";
import { redforts, RedfortsError } from "./client";
import type { InventoryField, InventoryResponse, Lang, RedfortsErrorItem } from "./types";

/**
 * Inventario de Redforts: catálogo de alojamientos, tarifas, textos, campos…
 *
 * Se cachea 1 h con la etiqueta `redforts-inventory`. Las demás respuestas
 * traen `inventory_version`; si es mayor que la cacheada, se invalida la
 * etiqueta y la siguiente lectura trae el inventario nuevo.
 *
 * ⚠️ El inventario incluye TODOS los códigos promocionales (`promos`). Nunca
 * se manda entero al navegador: usar `toPublicInventory`.
 */

export const INVENTORY_TAG = "redforts-inventory";

export function getInventory(): Promise<InventoryResponse> {
  return redforts<InventoryResponse>("inventory", {}, { retry: true, next: { revalidate: 3600, tags: [INVENTORY_TAG] } });
}

/** Si una respuesta trae una versión de inventario mayor, invalida la caché. */
export async function checkInventoryVersion(version: number | undefined): Promise<void> {
  if (typeof version !== "number") return;
  try {
    const cached = await getInventory();
    if (version > cached.version) {
      // `{ expire: 0 }`: la siguiente lectura va a Redforts, sin servir la versión vieja.
      revalidateTag(INVENTORY_TAG, { expire: 0 });
    }
  } catch {
    // Fuera de Next (script de pruebas) o si falla el inventario: no es crítico.
  }
}

/** Idioma a usar: el de la web si el hotel lo tiene activado; si no, el suyo por defecto. */
export function pickLang(inventory: InventoryResponse, wanted: Lang): Lang {
  return inventory.languages[wanted] ? wanted : inventory.default_lang;
}

/** Traduce los errores de Redforts con los textos del inventario (vienen en inglés). */
export function translateErrors(
  errors: RedfortsErrorItem[],
  inventory: InventoryResponse | null,
  lang: Lang,
): { code: number; message: string; values?: (string | number)[] }[] {
  const texts = inventory?.languages[lang]?.errors ?? {};
  return errors.map((e) => ({ code: e.code, message: texts[String(e.code)] ?? e.text, values: e.values }));
}

/** Mensaje legible para cualquier fallo al hablar con Redforts. */
export function describeError(error: unknown, inventory: InventoryResponse | null, lang: Lang): string[] {
  if (error instanceof RedfortsError) {
    if (error.kind === "api") return translateErrors(error.errors, inventory, lang).map((e) => e.message);
    if (error.kind === "engine_off") return ["La reserva online está desactivada en este momento. Escríbenos o llámanos."];
    if (error.kind === "timeout" || error.kind === "network" || error.kind === "http") {
      return ["El sistema de reservas no responde. Inténtalo de nuevo en unos minutos."];
    }
  }
  return ["No se ha podido completar la operación. Inténtalo de nuevo o contacta con nosotros."];
}

/* ── Versión pública (sin promos ni datos internos) ────────────────────── */

export type PublicAcco = {
  id: number;
  name: string;
  description: string | null;
  adults: number;
  children: number;
  images: { url: string; thumb: string; alt: string }[];
};
export type PublicRate = { id: number; name: string; description: string | null; cancellation: string | null; payment: string | null };
export type PublicItem = { id: number; name: string; description: string | null };

export type PublicInventory = {
  version: number;
  lang: Lang;
  currency: InventoryResponse["currency"];
  allowChildren: boolean;
  checkinFrom: string;
  checkinTo: string | null;
  checkout: string;
  accos: Record<string, PublicAcco>;
  rates: Record<string, PublicRate>;
  items: Record<string, PublicItem>;
  /** Campos del formulario. Los de tarjeta se excluyen: el pago va por Stripe. */
  fields: InventoryField[];
  countries: { code: string; name: string }[];
  consent: { title: string; text: string } | null;
  privacySummary: string | null;
  privacy: string | null;
  conditions: string | null;
  checkinout: string | null;
  noteText: string | null;
};

export function toPublicInventory(inv: InventoryResponse, wanted: Lang): PublicInventory {
  const lang = pickLang(inv, wanted);
  const t = inv.languages[lang];

  const accos: Record<string, PublicAcco> = {};
  for (const [id, a] of Object.entries(inv.accos)) {
    const name = t?.accos[id]?.name ?? a.name;
    accos[id] = {
      id: Number(id),
      name,
      description: t?.accos[id]?.description ?? null,
      adults: a.adults,
      children: a.children,
      images: a.images
        .map((imgId) => inv.images[String(imgId)])
        .filter(Boolean)
        .map((img, i) => ({
          url: img.url,
          thumb: img.thumbnail_url,
          alt: t?.images[String(a.images[i])]?.name ?? name,
        })),
    };
  }

  const rates: Record<string, PublicRate> = {};
  for (const [id, r] of Object.entries(inv.rates)) {
    const rt = t?.rates[id];
    rates[id] = {
      id: Number(id),
      name: rt?.name ?? r.name,
      description: rt?.description ?? null,
      cancellation: rt?.cancellation ?? null,
      payment: rt?.payment ?? null,
    };
  }

  const items: Record<string, PublicItem> = {};
  for (const [id, it] of Object.entries(inv.items)) {
    items[id] = { id: Number(id), name: t?.items[id]?.name ?? it.name, description: t?.items[id]?.description ?? null };
  }

  return {
    version: inv.version,
    lang,
    currency: inv.currency,
    allowChildren: inv.allow_children,
    checkinFrom: inv.checkin_from,
    checkinTo: inv.checkin_to ?? null,
    checkout: inv.checkout,
    accos,
    rates,
    items,
    fields: inv.fields.filter((f) => !f.id.startsWith("card_")),
    countries: Object.entries(t?.countries ?? {})
      .map(([code, name]) => ({ code: code.toUpperCase(), name }))
      .sort((a, b) => a.name.localeCompare(b.name, lang)),
    consent: t?.consent_title && t?.consent_text ? { title: t.consent_title, text: t.consent_text } : null,
    privacySummary: t?.privacy_summary ?? null,
    privacy: t?.privacy ?? null,
    conditions: t?.conditions ?? null,
    checkinout: t?.checkinout ?? null,
    noteText: t?.note_text ?? null,
  };
}
