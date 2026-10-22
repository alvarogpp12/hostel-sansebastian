import { describe, expect, it } from "vitest";
import { datesNotice } from "./dates-notice";

// Casos reales de Redforts (octubre de 2026: sin llegadas el 28-30, estancia hasta el 31)
describe("datesNotice", () => {
  it("día sin llegadas", () => {
    expect(datesNotice({ arrival: "2026-10-28", departure: "2026-10-31" }, { arrival: "2026-10-27", departure: "2026-10-31" })).toBe(
      "El 28 oct no se admiten llegadas. Fechas disponibles: 27 oct → 31 oct.",
    );
  });

  it("estancia mínima", () => {
    expect(datesNotice({ arrival: "2026-10-26", departure: "2026-10-28" }, { arrival: "2026-10-26", departure: "2026-10-31" })).toBe(
      "Llegando el 26 oct, la estancia mínima es de 5 noches. Fechas disponibles: 26 oct → 31 oct.",
    );
  });

  it("las dos cosas", () => {
    expect(datesNotice({ arrival: "2026-10-29", departure: "2026-10-30" }, { arrival: "2026-10-27", departure: "2026-10-31" })).toBe(
      "El 29 oct no se admiten llegadas; llegando el 27 oct, la estancia mínima es de 4 noches. Fechas disponibles: 27 oct → 31 oct.",
    );
  });
});
