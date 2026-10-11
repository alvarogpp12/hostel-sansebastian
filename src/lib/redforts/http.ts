import "server-only";
import { RedfortsError } from "./client";
import { describeError, getInventory } from "./inventory";
import type { InventoryResponse } from "./types";

/** Respuesta JSON de error para las rutas que hablan con Redforts */
export async function redfortsErrorResponse(error: unknown, lang = "es"): Promise<Response> {
  let inventory: InventoryResponse | null = null;
  try {
    inventory = await getInventory();
  } catch {
    /* sin inventario, los mensajes salen en inglés o genéricos */
  }
  const messages = describeError(error, inventory, lang);
  if (error instanceof RedfortsError) {
    // Errores de negocio (fechas, promo…): 422. Fallos de Redforts: 502/503.
    const status = error.kind === "api" ? 422 : error.kind === "engine_off" || error.kind === "config" ? 503 : 502;
    if (error.kind !== "api") console.error(error.message);
    return Response.json({ errors: messages, codes: error.codes }, { status });
  }
  console.error("[redforts] error inesperado", error);
  return Response.json({ errors: messages }, { status: 500 });
}
