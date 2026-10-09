import { describe, expect, it } from "vitest";
import { assignGuests, bestOtaSaving, offerOptions, optionKey, priceSelection, resolveSelection } from "./pricing";
import type { AvailabilityOption } from "./types";

const opt = (o: Partial<AvailabilityOption>): AvailabilityOption => ({
  arrival: "2027-01-10",
  departure: "2027-01-12",
  acco_id: 1,
  amount: 3,
  adults: 2,
  children: 0,
  price: 100,
  excl_taxes: null,
  prepayment_required: false,
  periods: [{ rate_id: 0, days: 2, price: 100 }],
  ...o,
});

describe("offerOptions", () => {
  it("filtra por capacidad cuando el grupo cabe en una habitación", () => {
    const small = opt({ acco_id: 1, adults: 2 });
    const family = opt({ acco_id: 4, adults: 4, price: 180 });
    const { options, combine } = offerOptions([small, family], 3, 0);
    expect(combine).toBe(false);
    expect(options.map((o) => o.acco_id)).toEqual([4]);
  });

  it("si nadie cabe solo, ofrece todo para combinar", () => {
    const { options, combine } = offerOptions([opt({ adults: 2 }), opt({ acco_id: 2, adults: 2 })], 4, 0);
    expect(combine).toBe(true);
    expect(options).toHaveLength(2);
  });

  it("con varias ocupaciones para la misma clave, se queda la más ajustada", () => {
    const one = opt({ adults: 1, price: 70 });
    const two = opt({ adults: 2, price: 100 });
    const { options } = offerOptions([two, one], 1, 0);
    expect(options).toHaveLength(1);
    expect(options[0].price).toBe(70);
  });
});

describe("assignGuests", () => {
  it("reparte un grupo de 4 en dos habitaciones dobles", () => {
    expect(assignGuests([{ adults: 2, children: 0 }, { adults: 2, children: 0 }], 4, 0)).toEqual([
      { adults: 2, children: 0 },
      { adults: 2, children: 0 },
    ]);
  });
  it("los niños usan plazas de adulto libres", () => {
    expect(assignGuests([{ adults: 2, children: 0 }], 1, 1)).toEqual([{ adults: 1, children: 1 }]);
  });
  it("null si no caben o falta un adulto por habitación", () => {
    expect(assignGuests([{ adults: 2, children: 0 }], 3, 0)).toBeNull();
    expect(assignGuests([{ adults: 2, children: 0 }, { adults: 2, children: 0 }], 1, 1)).toBeNull();
  });
});

describe("priceSelection", () => {
  it("promo porcentual: total con price, tachado con orig_price", () => {
    const b = priceSelection([{ option: opt({ price: 90, orig_price: 100 }), quantity: 2 }]);
    expect(b).toMatchObject({ subtotal: 180, originalSubtotal: 200, total: 180 });
  });
  it("promo de importe fijo limitada a promo_total (ejemplo de la especificación)", () => {
    const o = opt({ price: 250, promo_amount: 200 });
    expect(priceSelection([{ option: o, quantity: 1 }], 300).total).toBe(50);
    expect(priceSelection([{ option: o, quantity: 2 }], 300).total).toBe(200);
  });
  it("suma los impuestos no incluidos", () => {
    expect(priceSelection([{ option: opt({ price: 100, excl_taxes: 10 }), quantity: 1 }]).total).toBe(110);
  });
});

describe("bestOtaSaving", () => {
  it("devuelve la mayor diferencia a favor de la web", () => {
    expect(bestOtaSaving({ price: 100, ota_prices: { "Booking.com": 115, Expedia: 108 } })).toEqual({ ota: "Booking.com", saving: 15 });
    expect(bestOtaSaving({ price: 100, ota_prices: { "Booking.com": 95 } })).toBeNull();
  });
});

describe("resolveSelection", () => {
  const a = opt({ acco_id: 1, adults: 2 });
  const availability = { currency: "EUR", options: [a] };

  it("construye los accos con datos del servidor, no del cliente", () => {
    const r = resolveSelection(availability, [{ key: optionKey(a), quantity: 2 }], 4, 0);
    expect("error" in r).toBe(false);
    if ("error" in r) return;
    expect(r.accos).toHaveLength(2);
    expect(r.accos[0]).toEqual({ acco_id: 1, adults: 2, children: 0, price: 100, periods: [{ rate_id: 0, days: 2 }] });
    expect(r.breakdown.total).toBe(200);
  });

  it("error si la opción ya no existe (precio o tarifa cambiados)", () => {
    const r = resolveSelection(availability, [{ key: "1|2027-01-10|2027-01-12|9x2", quantity: 1 }], 2, 0);
    expect(r).toHaveProperty("error");
  });

  it("error si se piden más unidades de las que quedan", () => {
    const r = resolveSelection(availability, [{ key: optionKey(a), quantity: 4 }], 4, 0);
    expect(r).toHaveProperty("error");
  });
});
