import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Sin Redforts de verdad: inventario, disponibilidad y reserva simulados.
const createReservation = vi.fn();
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("@/lib/redforts/api", () => ({
  createReservation: (...args: unknown[]) => createReservation(...args),
  getAvailability: async () => ({ currency: "EUR", options: [] }),
  isTestMode: () => true,
}));
vi.mock("@/lib/redforts/client", async (importActual) => ({
  ...(await importActual<typeof import("@/lib/redforts/client")>()),
  isRedfortsConfigured: () => true,
}));
vi.mock("@/lib/redforts/inventory", async (importActual) => ({
  ...(await importActual<typeof import("@/lib/redforts/inventory")>()),
  getInventory: async () => ({
    default_lang: "es",
    languages: { es: { errors: {} } },
    fields: [
      { id: "firstnames", required: true },
      { id: "email", required: true },
      { id: "phone", required: true },
    ],
  }),
}));
vi.mock("@/lib/redforts/pricing", () => ({
  resolveSelection: () => ({
    arrival: "2026-11-10",
    departure: "2026-11-12",
    accos: [{ acco_id: 2, adults: 2, children: 0, price: 140, periods: [{ days: 2, rate_id: 0 }] }],
    chosen: [],
    currency: "EUR",
    breakdown: { total: 140 },
  }),
}));

const { startTpvReservation } = await import("@/app/reservar/actions");
const { RedfortsError } = await import("@/lib/redforts/client");

const input = {
  search: { arrival: "2026-11-10", departure: "2026-11-12", adults: 2 },
  selection: [{ key: "2|2026-11-10|2026-11-12|0x2", quantity: 1 }],
  guest: { firstnames: "Ana", surname: "Pérez", email: "ana@example.com", phone: "+34600000000" },
  notes: "Llegamos tarde",
  consent: true,
  expectedTotal: 140,
};

describe("startTpvReservation", () => {
  beforeEach(() => {
    vi.stubEnv("BOOKING_PROVIDER", "redforts");
    vi.stubEnv("CHECKOUT_MODE", "tpv");
    createReservation.mockReset();
  });
  afterEach(() => vi.unstubAllEnvs());

  it("crea una reserva real pendiente de pago y devuelve el enlace de Redforts", async () => {
    createReservation.mockResolvedValue({ status: "confirmed", id: 123, prepayment_required: true, url: "https://booking.redforts.com/abc" });
    const res = await startTpvReservation(input);

    expect(res).toEqual({ ok: true, url: "https://booking.redforts.com/abc" });
    const [req, opts] = createReservation.mock.calls[0];
    expect(opts).toEqual({ real: true });
    expect(req).toMatchObject({ status: "confirmed", surname: "Pérez", email: "ana@example.com", notes: "Llegamos tarde" });
    // Sin ignore_prepayment: así Redforts la deja pendiente de pago con el TPV
    expect(req).not.toHaveProperty("ignore_prepayment");
    expect(req).not.toHaveProperty("guest_notes");
  });

  it("no hace nada fuera del modo tpv", async () => {
    vi.stubEnv("CHECKOUT_MODE", "whatsapp");
    const res = await startTpvReservation(input);
    expect(res.ok).toBe(false);
    expect(createReservation).not.toHaveBeenCalled();
  });

  it("si la red falla, no reintenta y pide contactar", async () => {
    createReservation.mockRejectedValue(new RedfortsError("timeout", "reservation", "timeout"));
    const res = await startTpvReservation(input);
    expect(createReservation).toHaveBeenCalledTimes(1);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors[0]).toMatch(/WhatsApp/);
  });

  it("si Redforts no da enlace de pago, avisa con el número de reserva", async () => {
    createReservation.mockResolvedValue({ status: "confirmed", id: 456 });
    const res = await startTpvReservation(input);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors[0]).toMatch(/456/);
  });

  it("un precio distinto del visto no crea la reserva", async () => {
    const res = await startTpvReservation({ ...input, expectedTotal: 120 });
    expect(res).toMatchObject({ ok: false, newTotal: 140 });
    expect(createReservation).not.toHaveBeenCalled();
  });
});
