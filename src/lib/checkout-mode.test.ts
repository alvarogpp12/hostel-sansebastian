import { afterEach, describe, expect, it, vi } from "vitest";
import { checkoutMode } from "@/content/booking";

describe("checkoutMode", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("en producción, WhatsApp hasta dar el visto bueno al TPV", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("CHECKOUT_MODE", "");
    expect(checkoutMode()).toBe("whatsapp");
  });

  it("en las vistas previas, el TPV de Redforts", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("CHECKOUT_MODE", "");
    expect(checkoutMode()).toBe("tpv");
  });

  it("CHECKOUT_MODE manda; un valor desconocido se ignora", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("CHECKOUT_MODE", "tpv");
    expect(checkoutMode()).toBe("tpv");
    vi.stubEnv("CHECKOUT_MODE", "gratis");
    expect(checkoutMode()).toBe("whatsapp");
  });
});
