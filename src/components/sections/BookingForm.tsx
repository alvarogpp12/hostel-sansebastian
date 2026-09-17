"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { ArrowOut, Icon } from "@/components/icons";
import { TransitionLink } from "@/components/TransitionLink";
import { isEngineConfigured } from "@/content/booking";
import { bookingPage as b } from "@/content/pages";
import { priceLabel, rooms, type RoomId } from "@/content/rooms";
import { site } from "@/content/site";

const isRoomId = (v: string | null): v is RoomId => rooms.some((r) => r.id === v);

/** YYYY-MM-DD de hoy / hoy+n, para mínimos y valores por defecto */
const isoDay = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

function TextField({
  name,
  label,
  type = "text",
  autoComplete,
  className = "",
}: {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  className?: string;
}) {
  const [filled, setFilled] = useState(false);
  return (
    <div className={`field group ${className}`}>
      <input
        required
        className="peer"
        type={type}
        name={name}
        id={name}
        autoComplete={autoComplete}
        onChange={(e) => setFilled(e.target.value.length > 0)}
      />
      <label
        htmlFor={name}
        className={`pointer-events-none absolute top-3 uppercase transition-all peer-focus:-translate-y-4 peer-focus:opacity-0 ${
          filled ? "-translate-y-4 opacity-0" : ""
        }`}
      >
        {label}
      </label>
    </div>
  );
}

/**
 * Reserva a pantalla partida: a la izquierda la habitación elegida con sus
 * fotos, a la derecha fechas, personas, datos de la reserva y el pago.
 *
 * Al pagar, /api/checkout crea la sesión de Stripe y el huésped va a su
 * pantalla de pago; la reserva se crea después en Beds24 desde el webhook.
 * Mientras Beds24 no esté configurado (`src/content/booking.ts`), enseña
 * teléfono y email en lugar del botón.
 */
export function BookingForm() {
  const params = useSearchParams();
  const initial = params.get("habitacion");
  const [room, setRoom] = useState<RoomId>(isRoomId(initial) ? initial : "doble");
  const [checkIn, setCheckIn] = useState(isoDay());
  const [checkOut, setCheckOut] = useState(isoDay(1));
  const [adults, setAdults] = useState<number | null>(null);
  const [photo, setPhoto] = useState(0);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const selected = rooms.find((r) => r.id === room)!;
  const guests = adults ?? selected.guests;
  const configured = isEngineConfigured();
  const photos = useMemo(() => [selected.image, ...selected.gallery], [selected]);

  const nights = useMemo(() => {
    const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.max(0, Math.round(ms / 86_400_000));
  }, [checkIn, checkOut]);

  /** Total solo cuando hay precio confirmado; si no, el motor lo calcula */
  const total = selected.priceFrom !== null && nights > 0 ? selected.priceFrom * nights : null;

  /**
   * Manda los datos a /api/checkout, que crea la sesión de pago en Stripe y
   * devuelve su URL. Aquí no se toca ni un dato de tarjeta: de eso se encarga
   * la pantalla de Stripe.
   */
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setSending(true);
    setNotice(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitacion: room,
          entrada: checkIn,
          salida: checkOut,
          personas: guests,
          nombre: String(data.get("nombre") ?? ""),
          apellidos: String(data.get("apellidos") ?? ""),
          email: String(data.get("email") ?? ""),
          telefono: String(data.get("telefono") ?? ""),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { url?: string; message?: string };
      if (res.ok && json.url) {
        window.location.href = json.url;
        return;
      }
      setNotice(json.message ?? "No se pudo iniciar el pago.");
    } catch {
      setNotice("No se pudo conectar con la pasarela de pago. Revisa tu conexión.");
    } finally {
      setSending(false);
    }
  };

  const pickRoom = (id: RoomId) => {
    setRoom(id);
    setPhoto(0);
    const max = rooms.find((r) => r.id === id)!.guests;
    setAdults((current) => (current === null ? null : Math.min(current, max)));
  };

  return (
    <div className="grid items-start gap-w lg:grid-cols-2 xl:gap-16">
      {/* ── Izquierda: la habitación elegida ───────────────────────────── */}
      <section aria-label={selected.name} className="grid gap-3 lg:sticky lg:top-28">
        <div className="relative aspect-[4/3] w-full overflow-clip rounded-lg bg-neutral-200">
          <Image
            key={photos[photo].src}
            src={photos[photo].src}
            alt={photos[photo].alt}
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            priority
            className="object-cover"
          />
        </div>

        <ul className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {photos.map((p, i) => (
            <li key={p.src} className="shrink-0">
              <button
                type="button"
                onClick={() => setPhoto(i)}
                aria-label={`Foto ${i + 1} de ${selected.name}`}
                aria-current={i === photo}
                className={`relative block size-16 overflow-hidden rounded border transition-opacity duration-300 ${
                  i === photo ? "border-black opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={p.src} alt="" fill sizes="64px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>

        <div className="grid gap-2 pt-2">
          <h2 className="style-heading text-xl lg:text-2xl">{selected.name}</h2>
          <p className="style-caption-xs !font-light">{selected.meta}</p>
          <ul className="mt-1 grid gap-1">
            {selected.specs.map((s) => (
              <li key={s.text} className="flex items-center gap-3 text-sm">
                <Icon name={s.icon} className="size-4 shrink-0" />
                <span>{s.text}</span>
              </li>
            ))}
          </ul>
          <p className="max-w-[60ch] text-sm text-neutral-600">{selected.text}</p>
        </div>
      </section>

      {/* ── Derecha: fechas, datos y pago ──────────────────────────────── */}
      <form onSubmit={onSubmit} className="grid gap-6 text-sm">
        <fieldset className="grid gap-2">
          <legend className="style-caption-xs mb-2 !font-light">{b.fields.room}</legend>
          <div className="flex flex-wrap gap-2">
            {rooms.map((r) => (
              <div key={r.id} className="relative">
                <input
                  type="radio"
                  name="habitacion"
                  id={`room-${r.id}`}
                  value={r.id}
                  checked={room === r.id}
                  onChange={() => pickRoom(r.id)}
                  className="peer sr-only"
                />
                <label
                  htmlFor={`room-${r.id}`}
                  className="style-caption-xs block cursor-pointer rounded-2xl border border-neutral-300 px-3 py-1.5 !font-normal transition-all peer-checked:border-black peer-checked:bg-black peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-neutral-300 hover:bg-gray-50"
                >
                  {r.short}
                </label>
              </div>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-2.5 sm:grid-cols-3">
          <div className="field">
            <label htmlFor="entrada" className="style-caption-xs block !font-light">
              {b.fields.checkIn}
            </label>
            <input
              required
              type="date"
              id="entrada"
              name="entrada"
              min={isoDay()}
              value={checkIn}
              onChange={(e) => {
                setCheckIn(e.target.value);
                if (e.target.value >= checkOut) {
                  const next = new Date(e.target.value);
                  next.setDate(next.getDate() + 1);
                  setCheckOut(next.toISOString().slice(0, 10));
                }
              }}
              className="mt-1"
            />
          </div>
          <div className="field">
            <label htmlFor="salida" className="style-caption-xs block !font-light">
              {b.fields.checkOut}
            </label>
            <input
              required
              type="date"
              id="salida"
              name="salida"
              min={checkIn}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="field">
            <label htmlFor="personas" className="style-caption-xs block !font-light">
              {b.fields.guests}
            </label>
            <select
              required
              id="personas"
              name="personas"
              value={guests}
              onChange={(e) => setAdults(Number(e.target.value))}
              className="mt-1 w-full bg-transparent outline-none"
            >
              {Array.from({ length: selected.guests }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="grid gap-2.5">
          <legend className="style-caption-xs mb-2 !font-light">{b.fields.holder}</legend>
          <div className="grid gap-2.5 md:grid-cols-2">
            <TextField name="nombre" label={b.fields.firstname} autoComplete="given-name" />
            <TextField name="apellidos" label={b.fields.lastname} autoComplete="family-name" />
          </div>
          <TextField name="email" type="email" label={b.fields.email} autoComplete="email" />
          <TextField name="telefono" type="tel" label={b.fields.telephone} autoComplete="tel" />
        </fieldset>

        {/* Resumen */}
        <div className="grid gap-2 border-t border-neutral-300 pt-4">
          <p className="flex items-baseline justify-between gap-4">
            <span className="style-caption-xs !font-light">
              {selected.short} · {b.nights(nights)} · {guests} {guests === 1 ? "persona" : "personas"}
            </span>
            <span className="style-heading text-lg whitespace-nowrap">
              {total !== null ? `${total} €` : priceLabel(selected)}
            </span>
          </p>
          <p className="text-xs text-neutral-500">{b.priceNotice}</p>
        </div>

        {configured ? (
          <div className="grid gap-3">
            <button type="submit" disabled={sending} className="style-button w-full justify-center disabled:opacity-60">
              {sending ? b.sending : b.submit}
              <ArrowOut />
            </button>
            {notice && (
              <p role="alert" className="border border-red-400 p-3 text-xs">
                {notice}
              </p>
            )}
            <p className="text-xs text-neutral-500">
              {b.engineNotice}{" "}
              <TransitionLink href={site.legalLinks.terms.href} className="underline">
                {site.legalLinks.terms.label}
              </TransitionLink>
              .
            </p>
          </div>
        ) : (
          <div className="grid gap-3 border border-neutral-300 p-4">
            <p>{b.notConfigured}</p>
            <div className="flex flex-col">
              <a className="w-fit underline" href={`mailto:${site.contact.email}`}>
                {site.contact.email}
              </a>
              <a className="w-fit underline" href={site.contact.phoneHref}>
                {site.contact.phoneLabel}
              </a>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
