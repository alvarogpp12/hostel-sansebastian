"use server";

import { getItemList, getReservation, updateItems } from "@/lib/redforts/api";
import { isRedfortsConfigured, RedfortsError } from "@/lib/redforts/client";
import { describeError, getInventory, pickLang } from "@/lib/redforts/inventory";
import { itemsUpdateSchema, lookupSchema } from "@/lib/redforts/schemas";
import type { InventoryResponse } from "@/lib/redforts/types";

export type ReservationView = {
  reservId: number;
  arrival: string;
  departure: string;
  status: string;
  url: string | null;
  name: string;
  currency: string;
  days: number;
  accos: { name: string; adults: number; children: number; price: number }[];
  items: { id: number; name: string; description: string | null; price: number; daily: boolean; quantity: number; min: number; max: number }[];
};

export type LookupResult = { ok: true; reservation: ReservationView } | { ok: false; errors: string[] };

const SITE_LANG = "es";

async function load(reserv_id: number, arrival: string, email: string, inventory: InventoryResponse): Promise<ReservationView> {
  const lang = pickLang(inventory, SITE_LANG);
  const t = inventory.languages[lang];
  const [res, list] = await Promise.all([
    getReservation({ reserv_id, arrival, email }),
    getItemList({ reserv_id, arrival, email }).catch(() => null),
  ]);
  const items = (list?.items ?? res.items ?? []).filter((i) => i.may_offer);

  return {
    reservId: reserv_id,
    arrival: res.arrival ?? arrival,
    departure: res.departure ?? "",
    status: res.status ?? "",
    url: res.url ?? null,
    name: [res.firstnames, res.surname].filter(Boolean).join(" "),
    currency: res.currency ?? "EUR",
    days: list?.days ?? res.days ?? 0,
    accos: (res.accos ?? []).map((a) => ({
      name: t?.accos[String(a.acco_id)]?.name ?? inventory.accos[String(a.acco_id)]?.name ?? `Alojamiento ${a.acco_id}`,
      adults: a.adults,
      children: a.children ?? 0,
      price: a.price,
    })),
    items: items.map((i) => ({
      id: i.id,
      name: t?.items[String(i.id)]?.name ?? inventory.items[String(i.id)]?.name ?? `Extra ${i.id}`,
      description: t?.items[String(i.id)]?.description ?? null,
      price: i.price,
      daily: i.daily,
      quantity: i.quantity ?? 0,
      min: i.min,
      max: i.max ?? 10,
    })),
  };
}

/** Consulta una reserva con nº + fecha de llegada + email */
export async function lookupReservation(input: unknown): Promise<LookupResult> {
  if (!isRedfortsConfigured()) return { ok: false, errors: ["La consulta online no está disponible ahora mismo."] };
  const parsed = lookupSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: ["Revisa el número de reserva, la fecha de llegada y el email."] };
  let inventory: InventoryResponse | null = null;
  try {
    inventory = await getInventory();
    const { reserv_id, arrival, email } = parsed.data;
    return { ok: true, reservation: await load(reserv_id, arrival, email, inventory) };
  } catch (error) {
    if (!(error instanceof RedfortsError && error.kind === "api")) console.error("[mi-reserva] consulta", error);
    return { ok: false, errors: describeError(error, inventory, SITE_LANG) };
  }
}

/** Cambia los extras de una reserva (los extras se pagan en el alojamiento) */
export async function saveItems(input: unknown): Promise<LookupResult> {
  if (!isRedfortsConfigured()) return { ok: false, errors: ["La gestión online no está disponible ahora mismo."] };
  const parsed = itemsUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: ["Datos no válidos."] };
  let inventory: InventoryResponse | null = null;
  try {
    inventory = await getInventory();
    const { reserv_id, arrival, email, items } = parsed.data;
    const res = await updateItems({ reserv_id, arrival, email, items, lang: pickLang(inventory, SITE_LANG) });
    if (res.status !== "ok") return { ok: false, errors: ["No se han podido guardar los extras."] };
    return { ok: true, reservation: await load(reserv_id, arrival, email, inventory) };
  } catch (error) {
    if (!(error instanceof RedfortsError && error.kind === "api")) console.error("[mi-reserva] extras", error);
    return { ok: false, errors: describeError(error, inventory, SITE_LANG) };
  }
}
