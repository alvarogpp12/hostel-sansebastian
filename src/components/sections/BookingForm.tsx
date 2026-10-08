"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { ArrowOut, Icon } from "@/components/icons";
import { TransitionLink } from "@/components/TransitionLink";
import { buildEngineUrl, engineOrigin, isEngineConfigured } from "@/content/booking";
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

/**
 * Reserva a pantalla partida: a la izquierda la habitación elegida con sus
 * fotos, a la derecha la habitación y las fechas. Al buscar, debajo se abre el
 * motor de Redforts con todo preseleccionado; la disponibilidad, los datos del
 * huésped y el pago se hacen ahí. Mientras Redforts no esté configurado
 * (`src/content/booking.ts`), enseña teléfono y email en lugar del botón.
 */
export function BookingForm() {
  const params = useSearchParams();
  const initial = params.get("habitacion");
  const [room, setRoom] = useState<RoomId>(isRoomId(initial) ? initial : "doble");
  const [checkIn, setCheckIn] = useState(isoDay());
  const [checkOut, setCheckOut] = useState(isoDay(1));
  const [photo, setPhoto] = useState(0);
  const [engineUrl, setEngineUrl] = useState<string | null>(null);

  const selected = rooms.find((r) => r.id === room)!;
  const configured = isEngineConfigured();
  const photos = useMemo(() => [selected.image, ...selected.gallery], [selected]);

  const nights = useMemo(() => {
    const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.max(0, Math.round(ms / 86_400_000));
  }, [checkIn, checkOut]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEngineUrl(buildEngineUrl({ room, checkIn, checkOut }));
  };

  const pickRoom = (id: RoomId) => {
    setRoom(id);
    setPhoto(0);
  };

  return (
    <>
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

        {/* ── Derecha: habitación y fechas ───────────────────────────────── */}
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

          <div className="grid gap-2.5 sm:grid-cols-2">
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
          </div>

          {/* Resumen */}
          <div className="grid gap-2 border-t border-neutral-300 pt-4">
            <p className="flex items-baseline justify-between gap-4">
              <span className="style-caption-xs !font-light">
                {selected.short} · {b.nights(nights)}
              </span>
              <span className="style-heading text-lg whitespace-nowrap">{priceLabel(selected)}</span>
            </p>
          </div>

          {configured ? (
            <div className="grid gap-3">
              <button type="submit" disabled={nights === 0} className="style-button w-full justify-center disabled:opacity-60">
                {b.submit}
                <ArrowOut />
              </button>
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

      {engineUrl && <BookingEngine key={engineUrl} src={engineUrl} />}
    </>
  );
}

/**
 * Motor de Redforts incrustado. El iframe avisa de su altura con mensajes
 * "ohbe_<altura>" (igual que en su plugin de WordPress) y aquí se ajusta, para
 * que no haya doble barra de scroll.
 */
function BookingEngine({ src }: { src: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<string | null>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    const onMessage = (ev: MessageEvent) => {
      if (ev.origin !== engineOrigin || typeof ev.data !== "string" || !ev.data.startsWith("ohbe_")) return;
      const value = ev.data.split("_")[1];
      if (/^\d+(\.\d+)?px$/.test(value)) setHeight(value);
      else if (/^\d+(\.\d+)?$/.test(value)) setHeight(`${value}px`);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <section aria-label={b.engineTitle} className="mt-w scroll-mt-28">
      <iframe
        ref={ref}
        src={src}
        title={b.engineTitle}
        allow="payment"
        className="min-h-[80svh] w-full border-0"
        style={height ? { height } : undefined}
      />
      <p className="mt-2 text-xs text-neutral-500">
        {b.engineFallback}{" "}
        <a href={src} target="_blank" rel="noopener noreferrer" className="underline">
          {b.engineFallbackLink}
        </a>
        .
      </p>
    </section>
  );
}
