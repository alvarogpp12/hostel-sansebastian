import { describe, expect, it } from "vitest";
import { bookingRequestMessage, whatsAppUrl } from "./whatsapp";

describe("bookingRequestMessage", () => {
  const base = {
    arrival: "2026-11-10",
    departure: "2026-11-12",
    adults: 2,
    children: 0,
    rooms: [{ name: "Habitación doble", rate: "Solo alojamiento", quantity: 1, price: "120,00 €" }],
    total: "120,00 €",
    guest: [
      { label: "Nombre", value: "Ana" },
      { label: "Apellido", value: "García" },
      { label: "Email", value: "ana@example.com" },
      { label: "Teléfono", value: "" },
    ],
  };

  it("incluye habitación, fechas, noches, personas, precio y datos rellenados", () => {
    const m = bookingRequestMessage(base);
    expect(m).toContain("• Habitación: 1 × Habitación doble (Solo alojamiento) · 120,00 €");
    expect(m).not.toMatch(/\p{Extended_Pictographic}/u); // sin emojis: wa.me los rompe
    expect(m).toContain("Salida:");
    expect(m).toContain("(2 noches)");
    expect(m).toContain("2 adultos");
    expect(m).toContain("Precio que me sale en la web: 120,00 €");
    expect(m).toContain("• Nombre: Ana");
    expect(m).toContain("• Email: ana@example.com");
    expect(m).not.toContain("Teléfono"); // vacío: no se manda
  });

  it("añade niños, promo y comentarios si los hay", () => {
    const m = bookingRequestMessage({ ...base, children: 1, promo: "VERANO", notes: "Llegamos tarde" });
    expect(m).toContain("2 adultos y 1 niño");
    expect(m).toContain("Código promocional: VERANO");
    expect(m).toContain("Comentarios: Llegamos tarde");
  });

  it("whatsAppUrl codifica el texto", () => {
    expect(whatsAppUrl("34699901451", "Hola, ¿qué tal?")).toBe("https://wa.me/34699901451?text=Hola%2C%20%C2%BFqu%C3%A9%20tal%3F");
  });
});
