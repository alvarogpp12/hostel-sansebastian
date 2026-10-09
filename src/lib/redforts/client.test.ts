import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { redforts, RedfortsError } from "./client";

const CODE = "SECRETcode123";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("REDFORTS_CONNECTION_CODE", CODE);
  vi.stubEnv("REDFORTS_API_BASE", "https://booking.redforts.com/api");
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

async function catchError(p: Promise<unknown>): Promise<RedfortsError> {
  try {
    await p;
  } catch (e) {
    expect(e).toBeInstanceOf(RedfortsError);
    return e as RedfortsError;
  }
  throw new Error("Se esperaba un RedfortsError");
}

describe("redforts()", () => {
  it("hace POST con api_version 5 y el código en la URL", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ api_version: 5, options: [] }));
    const res = await redforts<{ options: unknown[] }>("availability", { arrival: "2027-01-10", departure: "2027-01-12" });

    expect(res.options).toEqual([]);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`https://booking.redforts.com/api/${CODE}/availability`);
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toContain("application/json");
    expect(JSON.parse(init.body)).toEqual({ arrival: "2027-01-10", departure: "2027-01-12", api_version: 5 });
    expect(init.cache).toBe("no-store");
  });

  it("pasa las opciones de caché de Next al fetch (inventario)", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ version: 3 }));
    await redforts("inventory", {}, { next: { revalidate: 3600, tags: ["redforts-inventory"] } });
    const init = fetchMock.mock.calls[0][1];
    expect(init.next).toEqual({ revalidate: 3600, tags: ["redforts-inventory"] });
    expect(init.cache).toBeUndefined();
  });

  it.each([
    [300, "The requested accommodations or rates are not available."],
    [301, "The requested price does not match the real price."],
    [203, "Arrival in the past."],
    [210, "This promotion code does not exist."],
  ])("lanza RedfortsError tipado con el código %i", async (code, text) => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ api_version: 5, status: "error", errors: [{ code, text }] }));
    const err = await catchError(redforts("reservation", {}));
    expect(err.kind).toBe("api");
    expect(err.codes).toEqual([code]);
    expect(err.has(code)).toBe(true);
    expect(err.transient).toBe(false);
    expect((err.data as { status: string }).status).toBe("error");
  });

  it("HTTP 404 → not_found (código de conexión incorrecto)", async () => {
    fetchMock.mockResolvedValueOnce(new Response("", { status: 404 }));
    const err = await catchError(redforts("inventory", {}));
    expect(err.kind).toBe("not_found");
    expect(err.status).toBe(404);
  });

  it("HTTP 406 → engine_off (motor desactivado)", async () => {
    fetchMock.mockResolvedValueOnce(new Response("", { status: 406 }));
    const err = await catchError(redforts("availability", {}));
    expect(err.kind).toBe("engine_off");
  });

  it("HTTP 400 → bad_request", async () => {
    fetchMock.mockResolvedValueOnce(new Response("", { status: 400 }));
    expect((await catchError(redforts("availability", {}))).kind).toBe("bad_request");
  });

  it("timeout → kind timeout, y nunca enseña el código en el mensaje", async () => {
    fetchMock.mockImplementationOnce(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener("abort", () => reject(init.signal?.reason));
        }),
    );
    const err = await catchError(redforts("availability", {}, { timeoutMs: 20 }));
    expect(err.kind).toBe("timeout");
    expect(err.transient).toBe(true);
    expect(err.message).not.toContain(CODE);
  });

  it("reintenta UNA vez las lecturas ante fallos de red", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError(`fetch failed https://booking.redforts.com/api/${CODE}/x`));
    fetchMock.mockResolvedValueOnce(jsonResponse({ api_version: 5, options: [] }));
    await redforts("availability", {}, { retry: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("no reintenta si no se pide (reservas) y no filtra el código", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError(`fetch failed https://booking.redforts.com/api/${CODE}/reservation`));
    const err = await catchError(redforts("reservation", {}));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(err.kind).toBe("network");
    expect(err.message).not.toContain(CODE);
  });

  it("no reintenta errores de negocio aunque se pida", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ errors: [{ code: 203, text: "Arrival in the past." }] }));
    await catchError(redforts("availability", {}, { retry: true }));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("sin código de conexión → config, sin llamar a la red", async () => {
    vi.stubEnv("REDFORTS_CONNECTION_CODE", "");
    const err = await catchError(redforts("inventory", {}));
    expect(err.kind).toBe("config");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
