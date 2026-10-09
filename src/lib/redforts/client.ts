import "server-only";
import type { RedfortsErrorItem } from "./types";

/**
 * Cliente genérico de la Redforts Booking API v5.
 *
 * - Solo servidor (`server-only`): la URL lleva el código de conexión, que es
 *   secreto. Nunca se loguea la URL ni se devuelve al navegador.
 * - Siempre POST + JSON + `api_version: 5`.
 * - Timeout de 10 s. Un único reintento, y solo en lecturas (`retry: true`):
 *   /reservation nunca se reintenta a ciegas, porque no hay idempotencia y
 *   se podría crear una reserva duplicada.
 * - Cualquier fallo se lanza como `RedfortsError`, con los códigos de la API.
 *
 * REDFORTS-DUDA: no hay documentación de CORS, límites de peticiones ni sandbox.
 */

export const API_VERSION = 5;
const DEFAULT_BASE = "https://booking.redforts.com/api";
const DEFAULT_TIMEOUT_MS = 10_000;

export type RedfortsErrorKind =
  /** Falta configuración (código de conexión) */
  | "config"
  /** HTTP 400: el JSON enviado no es válido */
  | "bad_request"
  /** HTTP 404: código de conexión incorrecto */
  | "not_found"
  /** HTTP 406: el motor de reservas está desactivado */
  | "engine_off"
  /** Otro código HTTP inesperado */
  | "http"
  /** La respuesta trae `errors` */
  | "api"
  | "timeout"
  | "network"
  | "invalid_response";

export class RedfortsError extends Error {
  readonly kind: RedfortsErrorKind;
  readonly endpoint: string;
  readonly status?: number;
  readonly errors: RedfortsErrorItem[];
  /** Cuerpo de la respuesta, si lo hubo (útil para `status` de /reservation) */
  readonly data?: unknown;

  constructor(
    kind: RedfortsErrorKind,
    endpoint: string,
    message: string,
    extra: { status?: number; errors?: RedfortsErrorItem[]; data?: unknown } = {},
  ) {
    super(`[redforts:${endpoint}] ${message}`);
    this.name = "RedfortsError";
    this.kind = kind;
    this.endpoint = endpoint;
    this.status = extra.status;
    this.errors = extra.errors ?? [];
    this.data = extra.data;
  }

  get codes(): number[] {
    return this.errors.map((e) => e.code);
  }

  has(code: number): boolean {
    return this.codes.includes(code);
  }

  /** ¿Tiene sentido reintentar? Solo fallos de transporte, nunca errores de negocio */
  get transient(): boolean {
    return this.kind === "timeout" || this.kind === "network" || (this.kind === "http" && (this.status ?? 0) >= 500);
  }
}

export type RedfortsOptions = {
  /** Reintentar una vez ante fallos de transporte. Solo para lecturas. */
  retry?: boolean;
  timeoutMs?: number;
  /** Opciones de caché de fetch de Next.js (p. ej. revalidate + tags para /inventory) */
  next?: { revalidate?: number | false; tags?: string[] };
  /** Por defecto "no-store", salvo que se pasen opciones `next` */
  cache?: RequestCache;
};

export function isRedfortsConfigured(): boolean {
  return Boolean(process.env.REDFORTS_CONNECTION_CODE?.trim());
}

function endpointUrl(endpoint: string): string {
  const code = process.env.REDFORTS_CONNECTION_CODE?.trim();
  if (!code) {
    throw new RedfortsError("config", endpoint, "Falta REDFORTS_CONNECTION_CODE (ver .env.example).");
  }
  const base = (process.env.REDFORTS_API_BASE?.trim() || DEFAULT_BASE).replace(/\/+$/, "");
  return `${base}/${encodeURIComponent(code)}/${endpoint}`;
}

const HTTP_KINDS: Record<number, [RedfortsErrorKind, string]> = {
  400: ["bad_request", "HTTP 400: el JSON enviado no es válido."],
  404: ["not_found", "HTTP 404: el código de conexión no corresponde a ningún cliente."],
  406: ["engine_off", "HTTP 406: el motor de reservas está desactivado."],
};

async function once<T>(endpoint: string, body: object, opts: RedfortsOptions): Promise<T> {
  const url = endpointUrl(endpoint);
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8", Accept: "application/json" },
      body: JSON.stringify({ ...body, api_version: API_VERSION }),
      signal: AbortSignal.timeout(timeoutMs),
      ...(opts.next ? { next: opts.next } : { cache: opts.cache ?? "no-store" }),
    });
  } catch (error) {
    const name = (error as { name?: string })?.name;
    if (name === "TimeoutError" || name === "AbortError") {
      throw new RedfortsError("timeout", endpoint, `Sin respuesta en ${timeoutMs / 1000} s.`);
    }
    // Ojo: no se incluye el mensaje original por si llevara la URL con el código.
    throw new RedfortsError("network", endpoint, "No se pudo conectar con Redforts.");
  }

  if (!res.ok) {
    const [kind, message] = HTTP_KINDS[res.status] ?? ["http", `HTTP ${res.status} inesperado.`];
    throw new RedfortsError(kind, endpoint, message, { status: res.status });
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new RedfortsError("invalid_response", endpoint, "La respuesta no es JSON válido.", { status: res.status });
  }
  if (!data || typeof data !== "object") {
    throw new RedfortsError("invalid_response", endpoint, "La respuesta no es un objeto JSON.", { data });
  }

  const errors = (data as { errors?: RedfortsErrorItem[] }).errors;
  if (Array.isArray(errors) && errors.length > 0) {
    const summary = errors.map((e) => `${e.code} ${e.text}`).join("; ");
    throw new RedfortsError("api", endpoint, summary, { status: res.status, errors, data });
  }

  return data as T;
}

/**
 * Llama a un endpoint de Redforts. Lanza `RedfortsError` ante cualquier fallo,
 * incluidas las respuestas con `errors`.
 */
export async function redforts<T>(endpoint: string, body: object = {}, opts: RedfortsOptions = {}): Promise<T> {
  try {
    return await once<T>(endpoint, body, opts);
  } catch (error) {
    if (opts.retry && error instanceof RedfortsError && error.transient) {
      return once<T>(endpoint, body, opts);
    }
    throw error;
  }
}
