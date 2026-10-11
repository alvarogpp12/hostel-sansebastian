import { describe, expect, it } from "vitest";
import { addDays, bookingHref, isIsoDay, localToday, nightsBetween, parseBookingSearch } from "./booking-search";

const from = (q: string) => {
  const p = new URLSearchParams(q);
  return (k: string) => p.get(k);
};

describe("parseBookingSearch", () => {
  const today = "2026-10-11";

  it("lee fechas, adultos y habitación válidos", () => {
    expect(parseBookingSearch(from("llegada=2026-10-16&salida=2026-10-18&adultos=2&habitacion=doble"), today)).toEqual({
      arrival: "2026-10-16",
      departure: "2026-10-18",
      adults: 2,
      room: "doble",
    });
  });

  it("acepta llegar hoy", () => {
    expect(parseBookingSearch(from("llegada=2026-10-11&salida=2026-10-12"), today).arrival).toBe("2026-10-11");
  });

  it("descarta una llegada pasada y, con ella, la salida", () => {
    expect(parseBookingSearch(from("llegada=2026-10-10&salida=2026-10-12"), today)).toMatchObject({ arrival: null, departure: null });
  });

  it("descarta una salida que no es posterior a la llegada", () => {
    expect(parseBookingSearch(from("llegada=2026-10-16&salida=2026-10-16"), today)).toMatchObject({
      arrival: "2026-10-16",
      departure: null,
    });
  });

  it("descarta fechas imposibles y adultos fuera de rango", () => {
    expect(parseBookingSearch(from("llegada=2026-02-31&adultos=0"), today)).toMatchObject({ arrival: null, adults: null });
    expect(parseBookingSearch(from("adultos=2.5"), today).adults).toBeNull();
    expect(parseBookingSearch(from("adultos=9"), today).adults).toBeNull();
  });

  it("sin parámetros devuelve todo vacío", () => {
    expect(parseBookingSearch(from(""), today)).toEqual({ arrival: null, departure: null, adults: null, room: null });
  });
});

describe("utilidades de fechas", () => {
  it("valida YYYY-MM-DD", () => {
    expect(isIsoDay("2026-10-16")).toBe(true);
    expect(isIsoDay("2026-13-01")).toBe(false);
    expect(isIsoDay("16/10/2026")).toBe(false);
    expect(isIsoDay(null)).toBe(false);
  });

  it("suma días y cuenta noches cruzando meses", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(nightsBetween("2026-10-30", "2026-11-02")).toBe(3);
  });

  it("formatea hoy en hora local", () => {
    expect(localToday(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
  });
});

describe("bookingHref", () => {
  it("construye el enlace a /reservar con lo que haya", () => {
    expect(bookingHref()).toBe("/reservar");
    expect(bookingHref({ room: "familiar" })).toBe("/reservar?habitacion=familiar");
    expect(bookingHref({ arrival: "2026-10-16", departure: "2026-10-18", adults: 2 })).toBe(
      "/reservar?llegada=2026-10-16&salida=2026-10-18&adultos=2",
    );
  });
});
