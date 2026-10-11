-- Reservas de la web pagadas con Stripe y creadas en Redforts.
--
-- Sirve para tres cosas:
--   1. Guardar los datos del huésped mientras paga (Stripe solo lleva el id).
--   2. Idempotencia del webhook: el paso pending → processing es un UPDATE
--      condicional y atómico, así que si Stripe manda el mismo evento dos
--      veces (o a la vez) solo uno crea la reserva.
--   3. Cuadrar cobros y reservas: payment_intent ↔ reserv_id.
--
-- Solo accede el servidor con la clave secreta: RLS activado y sin políticas.

create table if not exists public.redforts_bookings (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  status            text not null default 'pending'
                    check (status in (
                      'pending',        -- creada, esperando el pago
                      'processing',     -- el webhook la está reservando en Redforts
                      'confirmed',      -- reservada y cobrada
                      'unconfirmed',    -- Redforts la recibió sin confirmar: pago retenido, revisar
                      'rejected',       -- Redforts la rechazó: retención anulada, no se cobra
                      'unknown',        -- fallo de red al reservar: NO reintentar, revisar a mano
                      'capture_failed', -- reservada pero no se pudo cobrar: revisar a mano
                      'expired'         -- el huésped no llegó a pagar
                    )),

  stripe_session_id text unique,
  payment_intent_id text unique,
  amount_cents      integer not null check (amount_cents > 0),
  currency          text not null,

  arrival           date not null,
  departure         date not null,
  lang              text not null,
  test_mode         boolean not null,

  -- Petición a /reservation ya validada (datos del huésped incluidos)
  request           jsonb not null,

  reserv_id         bigint,
  guest_url         text,
  errors            jsonb
);

create index if not exists redforts_bookings_status_idx on public.redforts_bookings (status, created_at);

alter table public.redforts_bookings enable row level security;

create or replace function public.redforts_bookings_touch() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists redforts_bookings_touch on public.redforts_bookings;
create trigger redforts_bookings_touch before update on public.redforts_bookings
  for each row execute function public.redforts_bookings_touch();
