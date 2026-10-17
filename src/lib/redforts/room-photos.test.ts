import { beforeEach, describe, expect, it, vi } from "vitest";
import type { InventoryResponse } from "./types";

const inventory = vi.hoisted(() => ({ value: null as unknown, fail: false, configured: true }));

vi.mock("./client", () => ({ isRedfortsConfigured: () => inventory.configured }));
vi.mock("./inventory", () => ({
  getInventory: async () => {
    if (inventory.fail) throw new Error("Redforts caído");
    return inventory.value;
  },
  pickLang: () => "es",
}));

const { getRoomPhotos } = await import("./room-photos");

const inv = (accos: Record<string, number[]>) =>
  ({
    accos: Object.fromEntries(Object.entries(accos).map(([id, images]) => [id, { name: `Acco ${id}`, images }])),
    images: {
      "10": { url: "https://booking.redforts.com/cstatic/a.jpeg", thumbnail_url: "" },
      "11": { url: "https://booking.redforts.com/cstatic/b.jpeg", thumbnail_url: "" },
      "12": { url: "https://booking.redforts.com/cstatic/c.jpeg", thumbnail_url: "" },
    },
    languages: { es: { images: { "10": { name: "Cama de matrimonio" } } } },
  }) as unknown as InventoryResponse;

describe("getRoomPhotos", () => {
  beforeEach(() => {
    inventory.fail = false;
    inventory.configured = true;
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("asigna a cada habitación las fotos de su alojamiento, en orden", async () => {
    // doble → 2, dos-camas → 13, doble-privado → 1, familiar → 14 (content/booking.ts)
    inventory.value = inv({ "2": [10, 11], "13": [12], "14": [11] });
    const photos = await getRoomPhotos();
    expect(photos.doble?.map((p) => p.src)).toEqual([
      "https://booking.redforts.com/cstatic/a.jpeg",
      "https://booking.redforts.com/cstatic/b.jpeg",
    ]);
    expect(photos["dos-camas"]?.map((p) => p.src)).toEqual(["https://booking.redforts.com/cstatic/c.jpeg"]);
    expect(photos.familiar).toHaveLength(1);
  });

  it("usa el texto de Redforts como alt y, si no hay, uno con el nombre de la habitación", async () => {
    inventory.value = inv({ "2": [10, 11] });
    const [first, second] = (await getRoomPhotos()).doble!;
    expect(first.alt).toBe("Cama de matrimonio");
    expect(second.alt).toMatch(/foto 2$/);
  });

  it("deja fuera las habitaciones sin fotos en Redforts (la web usa las suyas)", async () => {
    inventory.value = inv({ "1": [], "2": [10] });
    const photos = await getRoomPhotos();
    expect(photos["doble-privado"]).toBeUndefined();
    expect(photos.doble).toHaveLength(1);
  });

  it("ignora imágenes que el inventario no describe", async () => {
    inventory.value = inv({ "2": [99, 10] });
    expect((await getRoomPhotos()).doble?.map((p) => p.src)).toEqual(["https://booking.redforts.com/cstatic/a.jpeg"]);
  });

  it("devuelve {} si Redforts falla o no está configurado", async () => {
    inventory.fail = true;
    expect(await getRoomPhotos()).toEqual({});
    inventory.fail = false;
    inventory.configured = false;
    expect(await getRoomPhotos()).toEqual({});
  });
});
