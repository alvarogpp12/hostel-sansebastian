import type { AvailabilityOption, AvailabilityResponse, ReservationAcco } from "./types";

/**
 * Lógica pura (sin red) sobre las opciones de /availability: claves, filtro
 * por capacidad, reparto de huéspedes y cálculo del importe. Se usa igual en
 * el servidor (fuente de verdad) y en el navegador (solo para mostrar).
 */

/** Identifica una opción: alojamiento + fechas + combinación de tarifas */
export function optionKey(o: Pick<AvailabilityOption, "acco_id" | "arrival" | "departure" | "periods">): string {
  const periods = o.periods.map((p) => `${p.rate_id}x${p.days}`).join(",");
  return `${o.acco_id}|${o.arrival}|${o.departure}|${periods}`;
}

/** Plazas de una opción. Un adulto puede cambiarse por un niño (Inventory Acco). */
export function fits(o: Pick<AvailabilityOption, "adults" | "children">, adults: number, children: number): boolean {
  return adults <= o.adults && adults + children <= o.adults + o.children;
}

export type OfferedOption = AvailabilityOption & { key: string };

/**
 * Deja una opción por clave y la filtra por capacidad.
 *
 * - Si caben todos en una sola habitación, solo se ofrecen las que caben; si
 *   la misma clave viene con distintas ocupaciones, se queda la menor que
 *   cabe (REDFORTS-DUDA: no está claro si `adults` de la opción es la
 *   ocupación del precio o la capacidad máxima).
 * - Si el grupo no cabe en ninguna habitación, se ofrecen todas (con la mayor
 *   capacidad por clave) para que el huésped combine varias.
 */
export function offerOptions(
  options: AvailabilityOption[],
  adults: number,
  children: number,
): { options: OfferedOption[]; combine: boolean } {
  const byKey = new Map<string, AvailabilityOption[]>();
  for (const o of options) {
    const k = optionKey(o);
    byKey.set(k, [...(byKey.get(k) ?? []), o]);
  }

  const single: OfferedOption[] = [];
  const largest: OfferedOption[] = [];
  for (const [key, group] of byKey) {
    const fitting = group.filter((o) => fits(o, adults, children)).sort((a, b) => a.adults + a.children - (b.adults + b.children));
    if (fitting[0]) single.push({ ...fitting[0], key });
    const biggest = [...group].sort((a, b) => b.adults + b.children - (a.adults + a.children))[0];
    largest.push({ ...biggest, key });
  }

  const byPrice = (a: OfferedOption, b: OfferedOption) => a.price - b.price;
  if (single.length > 0) return { options: single.sort(byPrice), combine: false };
  return { options: largest.sort(byPrice), combine: largest.length > 0 };
}

export type Unit = { adults: number; children: number };

/**
 * Reparte el grupo entre las unidades elegidas: al menos un adulto por unidad
 * y sin pasar la capacidad de ninguna. Devuelve null si no es posible.
 */
export function assignGuests(caps: Unit[], adults: number, children: number): Unit[] | null {
  if (caps.length === 0 || adults < caps.length) return null;
  const out = caps.map(() => ({ adults: 1, children: 0 }));
  let restA = adults - caps.length;
  let restC = children;
  if (caps.some((c) => c.adults < 1)) return null;

  for (let i = 0; i < caps.length && restA > 0; i++) {
    const add = Math.min(restA, caps[i].adults - out[i].adults);
    out[i].adults += add;
    restA -= add;
  }
  // Los niños ocupan primero plazas de niño y después plazas de adulto libres.
  for (let i = 0; i < caps.length && restC > 0; i++) {
    const free = caps[i].adults + caps[i].children - out[i].adults - out[i].children;
    const add = Math.min(restC, free);
    out[i].children += add;
    restC -= add;
  }
  return restA === 0 && restC === 0 ? out : null;
}

export type PriceBreakdown = {
  /** Suma de `price` de cada unidad */
  subtotal: number;
  /** Suma de `orig_price` (sin promo porcentual), si alguna lo trae */
  originalSubtotal: number | null;
  /** Descuento de promo de importe fijo (limitado a promo_total) */
  voucher: number;
  /** Impuestos no incluidos (excl_taxes) */
  taxes: number;
  /** Lo que se cobra */
  total: number;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Importe de una selección de opciones.
 *
 * REDFORTS-DUDA: con promo de importe fijo no está claro si el `price` que se
 * manda en la reserva debe ir ya descontado; se manda el `price` de la opción
 * y el descuento solo se aplica al importe cobrado.
 * REDFORTS-DUDA: si `excl_taxes` no es null, se suman esos impuestos al cobro.
 */
export function priceSelection(
  chosen: { option: AvailabilityOption; quantity: number }[],
  promoTotal?: number,
): PriceBreakdown {
  let subtotal = 0;
  let original = 0;
  let hasOriginal = false;
  let voucher = 0;
  let taxes = 0;
  for (const { option, quantity } of chosen) {
    subtotal += option.price * quantity;
    original += (option.orig_price ?? option.price) * quantity;
    if (option.orig_price !== undefined && option.orig_price !== option.price) hasOriginal = true;
    voucher += (option.promo_amount ?? 0) * quantity;
    if (option.excl_taxes) taxes += option.price * quantity * (option.excl_taxes / 100);
  }
  if (typeof promoTotal === "number") voucher = Math.min(voucher, promoTotal);
  voucher = Math.min(voucher, subtotal);
  return {
    subtotal: round2(subtotal),
    originalSubtotal: hasOriginal ? round2(original) : null,
    voucher: round2(voucher),
    taxes: round2(taxes),
    total: round2(subtotal - voucher + taxes),
  };
}

/** Comparativa con OTAs: la mayor diferencia a favor de la web, si la hay */
export function bestOtaSaving(o: Pick<AvailabilityOption, "price" | "ota_prices">): { ota: string; saving: number } | null {
  let best: { ota: string; saving: number } | null = null;
  for (const [ota, price] of Object.entries(o.ota_prices ?? {})) {
    const saving = round2(price - o.price);
    if (saving > 0 && (!best || saving > best.saving)) best = { ota, saving };
  }
  return best;
}

export type ResolvedSelection = {
  arrival: string;
  departure: string;
  accos: ReservationAcco[];
  chosen: { option: AvailabilityOption; quantity: number }[];
  breakdown: PriceBreakdown;
  currency: string;
};

/**
 * Convierte la selección del huésped (claves + cantidades) en los `accos` de
 * la reserva, usando SOLO datos de una respuesta de /availability recién
 * pedida en el servidor. Devuelve un mensaje de error si algo no cuadra.
 */
export function resolveSelection(
  availability: AvailabilityResponse,
  selection: { key: string; quantity: number }[],
  adults: number,
  children: number,
): ResolvedSelection | { error: string } {
  const all = availability.options ?? [];
  const chosen: { option: AvailabilityOption; quantity: number }[] = [];

  for (const { key, quantity } of selection) {
    const group = all.filter((o) => optionKey(o) === key);
    if (group.length === 0) return { error: "Una de las opciones elegidas ya no está disponible. Vuelve a buscar." };
    // La de mayor capacidad para poder repartir; el precio no depende de ello
    // salvo que Redforts mande opciones distintas por ocupación (ver offerOptions).
    const option = [...group].sort((a, b) => b.adults + b.children - (a.adults + a.children))[0];
    if (option.amount < quantity) return { error: "No quedan tantas habitaciones de ese tipo. Vuelve a buscar." };
    chosen.push({ option, quantity });
  }

  const { arrival, departure } = chosen[0].option;
  if (chosen.some((c) => c.option.arrival !== arrival || c.option.departure !== departure)) {
    return { error: "Todas las habitaciones de una reserva deben tener las mismas fechas." };
  }

  const units = chosen.flatMap((c) => Array.from({ length: c.quantity }, () => c.option));
  const split = assignGuests(units, adults, children);
  if (!split) return { error: "Las habitaciones elegidas no tienen plazas para todo el grupo." };

  // Si caben en una sola habitación, se usa la opción de ocupación más ajustada
  // (cuando Redforts manda varias, el precio puede depender de la ocupación).
  if (units.length === 1) {
    const fitting = all
      .filter((o) => optionKey(o) === selection[0].key && fits(o, adults, children))
      .sort((a, b) => a.adults + a.children - (b.adults + b.children))[0];
    if (fitting) {
      chosen[0] = { option: fitting, quantity: 1 };
      units[0] = fitting;
    }
  }

  const accos: ReservationAcco[] = units.map((o, i) => ({
    acco_id: o.acco_id,
    adults: split[i].adults,
    children: split[i].children,
    price: o.price,
    periods: o.periods.map((p) => ({ rate_id: p.rate_id, days: p.days })),
  }));

  return {
    arrival,
    departure,
    accos,
    chosen,
    breakdown: priceSelection(chosen, availability.promo_total),
    currency: availability.currency ?? "EUR",
  };
}
