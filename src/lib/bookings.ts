import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { RedfortsErrorItem, ReservationRequest } from "@/lib/redforts/types";

/**
 * Registro de reservas de la web en Supabase (tabla `redforts_bookings`, ver
 * supabase/migrations). Solo servidor, con la clave secreta.
 */

export type BookingStatus =
  | "pending"
  | "processing"
  | "confirmed"
  | "unconfirmed"
  | "rejected"
  | "unknown"
  | "capture_failed"
  | "expired";

/** Petición a /reservation sin los campos que pone el webhook */
export type StoredRequest = Omit<ReservationRequest, "api_test" | "status" | "ignore_prepayment" | "notes"> & {
  guest_notes?: string;
};

export type BookingRow = {
  id: string;
  created_at: string;
  updated_at: string;
  status: BookingStatus;
  stripe_session_id: string | null;
  payment_intent_id: string | null;
  amount_cents: number;
  currency: string;
  arrival: string;
  departure: string;
  lang: string;
  test_mode: boolean;
  request: StoredRequest;
  reserv_id: number | null;
  guest_url: string | null;
  errors: RedfortsErrorItem[] | null;
};

const TABLE = "redforts_bookings";
let client: SupabaseClient | null = null;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
}

function db(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Faltan SUPABASE_URL / SUPABASE_SECRET_KEY (ver .env.example).");
  client ??= createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

function check<T>(res: { data: T | null; error: { message: string } | null }, what: string): T {
  if (res.error) throw new Error(`[bookings] ${what}: ${res.error.message}`);
  return res.data as T;
}

export async function createBooking(row: {
  amount_cents: number;
  currency: string;
  arrival: string;
  departure: string;
  lang: string;
  test_mode: boolean;
  request: StoredRequest;
}): Promise<BookingRow> {
  return check(await db().from(TABLE).insert(row).select().single(), "crear");
}

export async function getBooking(id: string): Promise<BookingRow | null> {
  return check(await db().from(TABLE).select().eq("id", id).maybeSingle(), "leer");
}

export async function getBookingBySession(sessionId: string): Promise<BookingRow | null> {
  return check(await db().from(TABLE).select().eq("stripe_session_id", sessionId).maybeSingle(), "leer por sesión");
}

export async function updateBooking(id: string, patch: Partial<Omit<BookingRow, "id" | "created_at" | "updated_at">>) {
  check(await db().from(TABLE).update(patch).eq("id", id), "actualizar");
}

/**
 * Reclama la reserva para procesarla: pasa de `pending` a `processing` en un
 * único UPDATE condicional, que en Postgres es atómico. Si dos webhooks llegan
 * a la vez, solo uno recibe la fila; el otro recibe null y no hace nada.
 */
export async function claimBooking(id: string, paymentIntentId: string): Promise<BookingRow | null> {
  const rows = check<BookingRow[]>(
    await db()
      .from(TABLE)
      .update({ status: "processing", payment_intent_id: paymentIntentId })
      .eq("id", id)
      .eq("status", "pending")
      .select(),
    "reclamar",
  );
  return rows[0] ?? null;
}

/** Marca como caducada una reserva que no llegó a pagarse (solo si sigue pendiente) */
export async function expireBooking(id: string) {
  check(await db().from(TABLE).update({ status: "expired" }).eq("id", id).eq("status", "pending"), "caducar");
}
