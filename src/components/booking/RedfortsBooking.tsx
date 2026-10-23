"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useEffectEvent, useMemo, useRef, useState, useTransition, type FormEvent } from "react";
import { startCheckout, startTpvReservation } from "@/app/reservar/actions";
import { ArrowOut, WhatsAppGlyph } from "@/components/icons";
import { useLenis } from "@/components/providers/SmoothScroll";
import { TransitionLink } from "@/components/TransitionLink";
import { booking, type CheckoutMode } from "@/content/booking";
import { roomById, rooms } from "@/content/rooms";
import { localToday, MAX_ADULTS, nightsBetween, parseBookingSearch } from "@/lib/booking-search";
import { trackEvent } from "@/lib/analytics";
import { datesNotice } from "@/lib/redforts/dates-notice";
import type { PublicInventory } from "@/lib/redforts/inventory";
import { assignGuests, bestOtaSaving, priceSelection, type OfferedOption } from "@/lib/redforts/pricing";
import { site } from "@/content/site";
import { bookingRequestMessage, whatsAppUrl } from "@/lib/whatsapp";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { GalleryModal } from "@/components/sections/GalleryModal";
import { BookingSteps } from "./BookingSteps";

/**
 * Reserva nativa con la Booking API de Redforts (BOOKING_PROVIDER=redforts):
 *   1. Fechas (calendario con disponibilidad), personas y código promocional.
 *   2. Opciones de /availability: nombre, fotos y textos del inventario,
 *      precio (tachado si hay promo) y comparativa con las OTAs.
 *   3. Datos del huésped generados desde `fields` del inventario.
 *   4. Según `mode` (checkoutMode, lo decide el servidor):
 *      - "tpv": la reserva se crea en Redforts pendiente de pago y el huésped
 *        paga con el TPV virtual de Redforts (Server Action).
 *      - "whatsapp": solicitud de reserva por WhatsApp con todo ya escrito
 *        (habitación, fechas, personas, precio y datos). No se cobra nada.
 *      - "pay": pago con Stripe (Server Action).
 *      Con pago online, WhatsApp queda como alternativa debajo del botón.
 *      Los precios que se ven aquí son solo informativos: el servidor los
 *      vuelve a pedir a Redforts.
 *
 * Si la URL trae fechas (?llegada=…&salida=…&adultos=…, desde el buscador de
 * la home), busca nada más abrirse y salta directamente a las habitaciones.
 * Con ?habitacion=… la habitación elegida en la home sale la primera.
 */

type Results = { currency: string; promoTotal: number | null; combine: boolean; options: OfferedOption[] };

const FIELD_LABELS: Record<string, string> = {
  firstnames: "Nombre",
  middlenames: "Segundo nombre",
  surname: "Apellido",
  surname2: "Segundo apellido",
  address: "Dirección",
  postalcode: "Código postal",
  town: "Población",
  state: "Provincia",
  country: "País",
  email: "Email",
  phone: "Teléfono",
  phone2: "Otro teléfono",
  arrival_time: "Hora estimada de llegada",
  departure_time: "Hora estimada de salida",
};
const FIELD_TYPES: Record<string, string> = { email: "email", phone: "tel", phone2: "tel", arrival_time: "time", departure_time: "time" };
const AUTOCOMPLETE: Record<string, string> = {
  firstnames: "given-name",
  surname: "family-name",
  address: "street-address",
  postalcode: "postal-code",
  town: "address-level2",
  state: "address-level1",
  country: "country",
  email: "email",
  phone: "tel",
};

/** Habitación de la web que corresponde a un alojamiento de Redforts (booking.accoIds) */
const roomForAcco = (accoId: number) => rooms.find((r) => booking.accoIds[r.id] === String(accoId));

const dateFmt = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", timeZone: "UTC" });
const fmtDate = (iso: string) => dateFmt.format(new Date(`${iso}T00:00:00Z`));

export function RedfortsBooking({ inventory, mode }: { inventory: PublicInventory; mode: CheckoutMode }) {
  const params = useSearchParams();
  // Solo se renderiza en el navegador (useSearchParams bajo Suspense): "hoy" es el del huésped
  const [initial] = useState(() => parseBookingSearch((k) => params.get(k), localToday()));
  const [arrival, setArrival] = useState<string | null>(initial.arrival);
  const [departure, setDeparture] = useState<string | null>(initial.departure);
  const [adults, setAdults] = useState(initial.adults ?? 2);
  const [children, setChildren] = useState(0);
  const [promo, setPromo] = useState("");
  const [showPromo, setShowPromo] = useState(false);

  const lenis = useLenis();
  const resultsRef = useRef<HTMLElement>(null);
  const checkoutRef = useRef<HTMLFormElement>(null);
  const scrollTo = (el: HTMLElement | null) => {
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -96, duration: 0.8 });
    else el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /** Habitación elegida en la home → su id en Redforts, para enseñarla la primera */
  const preferredAcco = useMemo(() => {
    const room = roomById(initial.room);
    return room ? booking.accoIds[room.id] : null;
  }, [initial.room]);

  const [results, setResults] = useState<Results | null>(null);
  const [searching, setSearching] = useState(Boolean(initial.arrival && initial.departure));
  const [searchErrors, setSearchErrors] = useState<string[]>([]);
  /** Búsqueda con la que se obtuvieron los resultados (la que se manda al pagar) */
  const [lastSearch, setLastSearch] = useState<{ arrival: string; departure: string; adults: number; children: number; promo?: string } | null>(null);

  const [selection, setSelection] = useState<Record<string, number>>({});
  const [guest, setGuest] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [checkoutErrors, setCheckoutErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [paying, startPaying] = useTransition();
  const [galleryAcco, setGalleryAcco] = useState<number | null>(null);

  const money = useMemo(
    () => new Intl.NumberFormat("es-ES", { style: "currency", currency: results?.currency ?? "EUR" }),
    [results?.currency],
  );

  /** Código promocional aplicado («Aplicar» o Enter); el del campo puede estar a medio escribir */
  const [appliedPromo, setAppliedPromo] = useState("");
  /** Solo cuenta la respuesta de la última petición (se puede cambiar algo mientras busca) */
  const requestId = useRef(0);
  /** Fechas de la última búsqueda: solo se baja a los resultados si cambian */
  const searchedDates = useRef<string | null>(null);
  /** Código rechazado por Redforts: se avisa junto al campo y se busca sin él */
  const [promoError, setPromoError] = useState<string | null>(null);
  /** Al quitar un código rechazado no hace falta repetir la búsqueda: ya se hizo sin él */
  const skipNextSearch = useRef(false);

  /** Consulta /availability con la búsqueda actual; el estado se actualiza después del await */
  const runSearch = async () => {
    if (!arrival || !departure) return;
    const id = ++requestId.current;
    const promoCode = appliedPromo || undefined;
    setSearching(true);
    setSearchErrors([]);
    setSelection({});
    setCheckoutErrors([]);
    const query = async (code?: string) => {
      const params = new URLSearchParams({ arrival, departure, adults: String(adults), children: String(children) });
      if (code) params.set("promo", code);
      const res = await fetch(`/api/redforts/availability?${params}`);
      return { res, json: await res.json() };
    };
    try {
      let { res, json } = await query(promoCode);
      // Redforts rechaza la búsqueda entera si el código no vale (no existe,
      // caducado…). Si sin código funciona, era el código: se enseñan las
      // habitaciones al precio normal y se avisa junto al campo.
      let rejected: string | null = null;
      if (!res.ok && promoCode) {
        const retry = await query();
        if (retry.res.ok) {
          rejected = json.errors?.[0] ?? "El código promocional no es válido.";
          ({ res, json } = retry);
        }
      }
      if (id !== requestId.current) return;
      setPromoError(rejected);
      if (rejected) {
        trackEvent("Reserva · error", { paso: "búsqueda", motivo: "código promocional" });
        skipNextSearch.current = true;
        setAppliedPromo("");
      }
      const stats = { noches: nightsBetween(arrival, departure), personas: adults + children };
      if (!res.ok) {
        setResults(null);
        setSearchErrors(json.errors ?? ["No se pudo consultar la disponibilidad."]);
        trackEvent("Reserva · error", { paso: "búsqueda", motivo: `HTTP ${res.status}` });
        return;
      }
      const found = json as Results;
      trackEvent("Reserva · búsqueda", stats);
      if (found.options.length === 0) trackEvent("Reserva · sin disponibilidad", stats);
      else if (found.options.every((o) => o.arrival !== arrival || o.departure !== departure)) {
        const first = found.options[0];
        const motivo =
          first.arrival !== arrival && first.departure !== departure ? "llegada y estancia" : first.arrival !== arrival ? "llegada" : "estancia";
        trackEvent("Reserva · fechas no disponibles", { motivo, noches: stats.noches });
      }
      setResults(found);
      setLastSearch({ arrival, departure, adults, children, promo: rejected ? undefined : promoCode });
      // Con fechas nuevas, baja a los resultados (al cambiar personas o código, no)
      const dates = `${arrival}|${departure}`;
      if (dates !== searchedDates.current) {
        searchedDates.current = dates;
        requestAnimationFrame(() => scrollTo(resultsRef.current));
      }
    } catch {
      if (id !== requestId.current) return;
      setSearchErrors(["No se pudo conectar con el sistema de reservas."]);
      trackEvent("Reserva · error", { paso: "búsqueda", motivo: "sin conexión" });
    } finally {
      if (id === requestId.current) setSearching(false);
    }
  };

  // Busca sola, sin botón: al llegar con fechas en la URL (desde la home) y cada
  // vez que se completan las fechas o cambian las personas o el código aplicado.
  const autoSearch = useEffectEvent(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }
    void runSearch();
  });
  useEffect(() => {
    if (!arrival || !departure) return;
    const timer = window.setTimeout(autoSearch, 250);
    return () => window.clearTimeout(timer);
  }, [arrival, departure, adults, children, appliedPromo]);

  const applyPromo = (e?: FormEvent) => {
    e?.preventDefault();
    setAppliedPromo(promo.trim());
  };

  // Vuelta desde Stripe sin pagar (cancel_url)
  const cancelledPayment = params.get("pago") === "cancelado";
  useEffect(() => {
    if (cancelledPayment) trackEvent("Reserva · pago cancelado");
  }, [cancelledPayment]);

  const chosen = useMemo(
    () =>
      (results?.options ?? [])
        .filter((o) => (selection[o.key] ?? 0) > 0)
        .map((option) => ({ option, quantity: selection[option.key] })),
    [results, selection],
  );
  const breakdown = chosen.length ? priceSelection(chosen, results?.promoTotal ?? undefined) : null;
  const units = chosen.flatMap((c) => Array.from({ length: c.quantity }, () => c.option));
  const guestsFit = lastSearch && units.length ? assignGuests(units, lastSearch.adults, lastSearch.children) !== null : false;

  const setQty = (o: OfferedOption, qty: number) => {
    setCheckoutErrors([]);
    setSelection((prev) => {
      // Una reserva tiene unas únicas fechas: elegir otras fechas vacía la selección.
      const sameDates = chosen.every((c) => c.option.arrival === o.arrival && c.option.departure === o.departure);
      const next = sameDates ? { ...prev } : {};
      if (!results?.combine) for (const k of Object.keys(next)) if (k !== o.key) delete next[k];
      if (qty > 0) next[o.key] = qty;
      else delete next[o.key];
      return next;
    });
    if (qty > 0)
      trackEvent("Reserva · habitación elegida", {
        habitacion: roomForAcco(o.acco_id)?.id ?? String(o.acco_id),
        noches: nightsBetween(o.arrival, o.departure),
      });
    // Con una sola habitación por reserva, elegir es el último paso: a los datos
    if (qty > 0 && !results?.combine) requestAnimationFrame(() => scrollTo(checkoutRef.current));
  };

  const viaWhatsApp = mode === "whatsapp";
  /** Habitaciones de la selección, para las estadísticas (ids de content/rooms) */
  const soldRooms = () => chosen.map((c) => roomForAcco(c.option.acco_id)?.id ?? String(c.option.acco_id)).join(" + ");

  /** Abre WhatsApp con la solicitud de reserva ya escrita */
  const requestByWhatsApp = () => {
    if (!lastSearch || !breakdown) return;
    const rateNames = (o: OfferedOption) =>
      [...new Set(o.periods.map((p) => inventory.rates[String(p.rate_id)]?.name).filter(Boolean))].join(" + ") || undefined;
    const message = bookingRequestMessage({
      arrival: chosen[0].option.arrival,
      departure: chosen[0].option.departure,
      adults: lastSearch.adults,
      children: lastSearch.children,
      rooms: chosen.map(({ option, quantity }) => ({
        name: inventory.accos[String(option.acco_id)]?.name ?? `Habitación ${option.acco_id}`,
        rate: rateNames(option),
        quantity,
        price: money.format(option.price * quantity),
      })),
      total: money.format(breakdown.total),
      promo: lastSearch.promo,
      guest: inventory.fields.map((f) => ({
        label: FIELD_LABELS[f.id] ?? f.id,
        value: f.id === "country" ? (inventory.countries.find((c) => c.code === guest.country)?.name ?? "") : (guest[f.id] ?? ""),
      })),
      notes,
    });
    const url = whatsAppUrl(site.contact.whatsapp.number, message);
    trackEvent("Reserva · solicitud por WhatsApp", { habitacion: soldRooms(), importe: Math.round(breakdown.total) });
    // En el ordenador, en otra pestaña; si el navegador la bloquea, en esta.
    // (Sin "noopener" en las opciones: con él window.open devuelve siempre null.)
    const win = window.open(url, "_blank");
    if (win) win.opener = null;
    else window.location.assign(url);
  };

  const pay = (e: FormEvent) => {
    e.preventDefault();
    if (!lastSearch || !breakdown) return;
    if (viaWhatsApp) {
      requestByWhatsApp();
      return;
    }
    setCheckoutErrors([]);
    setFieldErrors({});
    trackEvent("Reserva · pago iniciado", { habitacion: soldRooms(), importe: Math.round(breakdown.total) });
    startPaying(async () => {
      const res = await (mode === "tpv" ? startTpvReservation : startCheckout)({
        search: lastSearch,
        selection: chosen.map((c) => ({ key: c.option.key, quantity: c.quantity })),
        guest,
        notes: notes.trim() || undefined,
        consent,
        expectedTotal: breakdown.total,
      });
      if (res.ok) {
        window.location.href = res.url;
        return;
      }
      setCheckoutErrors(res.errors);
      setFieldErrors(res.fieldErrors ?? {});
      trackEvent("Reserva · error", {
        paso: "pago",
        motivo: res.newTotal !== undefined ? "precio cambiado" : res.fieldErrors && Object.keys(res.fieldErrors).length ? "datos del huésped" : "otro",
      });
      if (res.newTotal !== undefined) await runSearch();
    });
  };

  const byAcco = useMemo(() => {
    const map = new Map<number, OfferedOption[]>();
    for (const o of results?.options ?? []) map.set(o.acco_id, [...(map.get(o.acco_id) ?? []), o]);
    const entries = [...map.entries()];
    if (preferredAcco) entries.sort(([a], [b]) => Number(String(b) === preferredAcco) - Number(String(a) === preferredAcco));
    return entries;
  }, [results, preferredAcco]);

  const step = breakdown ? 3 : results ? 2 : 1;

  return (
    <div className="grid gap-10">
      <BookingSteps current={step} lastLabel={viaWhatsApp ? "Tus datos y solicitud" : undefined} />

      {/* ── 1. Búsqueda ─────────────────────────────────────────────── */}
      <form onSubmit={applyPromo} className="grid items-start gap-w text-sm lg:grid-cols-2">
        <AvailabilityCalendar
          arrival={arrival}
          departure={departure}
          onChange={(a, d) => {
            setArrival(a);
            setDeparture(d);
          }}
        />
        <div className="grid gap-5">
          <p className="style-heading text-lg">
            {arrival ? fmtDate(arrival) : "Llegada"} → {departure ? fmtDate(departure) : "Salida"}
            {arrival && departure && <span className="font-body text-sm"> · {nightsBetween(arrival, departure)} noches</span>}
          </p>
          <div className={`grid gap-2.5 ${inventory.allowChildren ? "grid-cols-2" : ""}`}>
            <label className="field">
              <span className="style-caption-xs block !font-light">Adultos</span>
              <select value={adults} onChange={(e) => setAdults(Number(e.target.value))} className="mt-1 w-full bg-transparent outline-none">
                {Array.from({ length: MAX_ADULTS }, (_, i) => i + 1).map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
            {inventory.allowChildren && (
              <label className="field">
                <span className="style-caption-xs block !font-light">Niños</span>
                <select value={children} onChange={(e) => setChildren(Number(e.target.value))} className="mt-1 w-full bg-transparent outline-none">
                  {Array.from({ length: 7 }, (_, i) => i).map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
            )}
          </div>
          {showPromo ? (
            <div className="flex items-end gap-2">
              <label className="field flex-1">
                <span className="style-caption-xs block !font-light">Código promocional</span>
                <input
                  value={promo}
                  onChange={(e) => {
                    setPromo(e.target.value);
                    setPromoError(null);
                  }}
                  maxLength={40}
                  className="mt-1 w-full"
                  autoComplete="off"
                  autoFocus
                  aria-invalid={promoError ? true : undefined}
                  aria-describedby={promoError ? "promo-error" : undefined}
                />
              </label>
              <button type="submit" disabled={promo.trim() === appliedPromo || Boolean(promoError)} className="style-button min-h-12 disabled:opacity-40">
                Aplicar
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setShowPromo(true)} className="w-fit text-xs underline">
              ¿Tienes un código promocional?
            </button>
          )}
          {promoError && (
            <p id="promo-error" role="alert" className="-mt-3 text-xs text-red-700">
              {promoError} Te enseñamos los precios sin descuento.
            </p>
          )}
          <p aria-live="polite" className="min-h-5 text-xs text-neutral-500">
            {searching
              ? "Buscando habitaciones libres…"
              : results && arrival && departure
                ? "Cambia las fechas o las personas y los precios se actualizan solos."
                : null}
          </p>
          {searchErrors.length > 0 && (
            <ul role="alert" className="border border-red-400 p-3 text-xs">
              {searchErrors.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          )}
        </div>
      </form>

      {/* ── 2. Opciones ─────────────────────────────────────────────── */}
      {results && (
        <section ref={resultsRef} aria-label="Habitaciones disponibles" className="grid scroll-mt-24 gap-4">
          {results.options.length === 0 ? (
            <p className="border border-neutral-300 p-4">
              No hay habitaciones libres para esas fechas. Prueba con otras o escríbenos a{" "}
              <a className="underline" href={`mailto:${site.contact.email}`}>
                {site.contact.email}
              </a>
              .
            </p>
          ) : (
            results.combine && (
              <p className="text-sm text-neutral-600">Ninguna habitación tiene plazas para todo el grupo: combina varias.</p>
            )
          )}
          {byAcco.map(([accoId, options]) => {
            const acco = inventory.accos[String(accoId)];
            // Fotos nuestras (content/media.ts), no las de Redforts
            const room = roomForAcco(accoId);
            const photos = room ? [room.image, ...room.gallery] : [];
            return (
              <article key={accoId} className="grid gap-4 rounded-lg border border-neutral-300 p-2 md:grid-cols-[12rem_1fr]">
                <div className="relative aspect-[4/3] overflow-clip rounded-lg bg-neutral-200 md:aspect-auto">
                  {photos[0] && (
                    <>
                      <Image src={photos[0].src} alt={photos[0].alt} fill sizes="(min-width: 768px) 12rem, 100vw" className="object-cover" />
                      {photos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setGalleryAcco(accoId)}
                          data-evento="Ver fotos"
                          data-zona={`habitación ${room?.id ?? accoId}`}
                          className="absolute inset-0 flex cursor-zoom-in items-end justify-end p-2"
                          aria-label={`${site.ui.openGallery}: ${acco?.name ?? room?.name ?? ""}`}
                        >
                          <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium shadow-sm">
                            {site.ui.openGallery} ({photos.length})
                          </span>
                        </button>
                      )}
                    </>
                  )}
                </div>
                <div className="grid gap-3 p-2">
                  <div className="grid gap-1">
                    {String(accoId) === preferredAcco && <span className="style-caption-xs w-fit rounded-full bg-offwhite px-2.5 py-1">Tu elección</span>}
                    <h3 className="style-heading text-lg lg:text-xl">{acco?.name ?? `Alojamiento ${accoId}`}</h3>
                    {acco?.description && <p className="text-sm whitespace-pre-line text-neutral-600">{acco.description}</p>}
                  </div>
                  <ul className="grid gap-2">
                    {options.map((o) => {
                      const rateNames = [...new Set(o.periods.map((p) => inventory.rates[String(p.rate_id)]?.name ?? "Tarifa"))].join(" + ");
                      const otherDates = lastSearch && (o.arrival !== lastSearch.arrival || o.departure !== lastSearch.departure);
                      const saving = bestOtaSaving(o);
                      const qty = selection[o.key] ?? 0;
                      return (
                        <li key={o.key} className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-2">
                          <div className="grid gap-0.5 text-sm">
                            <span>{rateNames}</span>
                            <span className="text-xs text-neutral-500">
                              Hasta {o.adults + o.children} {o.adults + o.children === 1 ? "persona" : "personas"} · quedan {o.amount}
                            </span>
                            {otherDates && (
                              <span className="text-xs text-amber-700">
                                {datesNotice(lastSearch, o)}
                              </span>
                            )}
                            {saving && (
                              <span className="text-xs text-green-700">
                                {money.format(saving.saving)} más barato que en {saving.ota}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-right">
                              {o.orig_price !== undefined && o.orig_price !== o.price && (
                                <s className="block text-xs text-neutral-500">{money.format(o.orig_price)}</s>
                              )}
                              <span className="style-heading text-lg">{money.format(o.price)}</span>
                              {o.excl_taxes ? <span className="block text-xs text-neutral-500">+ {o.excl_taxes}% impuestos</span> : null}
                            </span>
                            {results.combine ? (
                              <select
                                aria-label={`Cantidad de ${acco?.name ?? ""} ${rateNames}`}
                                value={qty}
                                onChange={(e) => setQty(o, Number(e.target.value))}
                                className="rounded border border-neutral-300 bg-transparent px-2 py-1"
                              >
                                {Array.from({ length: Math.min(o.amount, 10) + 1 }, (_, i) => (
                                  <option key={i} value={i}>
                                    {i}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setQty(o, qty ? 0 : 1)}
                                aria-pressed={qty > 0}
                                className={`rounded-2xl border px-3 py-1.5 text-xs uppercase transition-colors ${
                                  qty ? "border-black bg-black text-white" : "border-neutral-300 hover:bg-neutral-100"
                                }`}
                              >
                                {qty ? "Elegida" : "Elegir"}
                              </button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {galleryAcco !== null &&
        (() => {
          const room = roomForAcco(galleryAcco);
          return room ? (
            <GalleryModal
              open
              onClose={() => setGalleryAcco(null)}
              title={inventory.accos[String(galleryAcco)]?.name ?? room.name}
              meta={room.meta}
              images={[room.image, ...room.gallery]}
            />
          ) : null;
        })()}

      {/* ── 3. Datos y pago ─────────────────────────────────────────── */}
      {breakdown && lastSearch && (
        <form ref={checkoutRef} onSubmit={pay} className="grid scroll-mt-24 gap-6 border-t border-neutral-300 pt-8 text-sm lg:grid-cols-2 lg:gap-w">
          <fieldset className="grid content-start gap-2.5">
            <legend className="style-heading mb-4 text-xl">Tus datos</legend>
            {inventory.fields.map((f) => {
              const label = `${FIELD_LABELS[f.id] ?? f.id}${f.required ? " *" : ""}`;
              const err = fieldErrors[f.id];
              return (
                <label key={f.id} className="field">
                  <span className="style-caption-xs block !font-light">{label}</span>
                  {f.id === "country" ? (
                    <select
                      required={f.required}
                      value={guest.country ?? ""}
                      onChange={(e) => setGuest({ ...guest, country: e.target.value })}
                      className="mt-1 w-full bg-transparent outline-none"
                      autoComplete="country"
                    >
                      <option value="">—</option>
                      {inventory.countries.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      required={f.required}
                      type={FIELD_TYPES[f.id] ?? "text"}
                      autoComplete={AUTOCOMPLETE[f.id]}
                      value={guest[f.id] ?? ""}
                      onChange={(e) => setGuest({ ...guest, [f.id]: e.target.value })}
                      className="mt-1 w-full"
                      aria-invalid={Boolean(err)}
                    />
                  )}
                  {err && <span className="text-xs text-red-600">{err}</span>}
                </label>
              );
            })}
            <label className="field">
              <span className="style-caption-xs block !font-light">{inventory.noteText ?? "Comentarios (opcional)"}</span>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} rows={3} className="mt-1 w-full bg-transparent" />
            </label>
          </fieldset>

          <div className="grid content-start gap-4">
            <h2 className="style-heading text-xl">Tu reserva</h2>
            <ul className="grid gap-1">
              {chosen.map(({ option, quantity }) => (
                <li key={option.key} className="flex justify-between gap-4">
                  <span>
                    {quantity} × {inventory.accos[String(option.acco_id)]?.name ?? option.acco_id}
                  </span>
                  <span>{money.format(option.price * quantity)}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-neutral-500">
              {fmtDate(chosen[0].option.arrival)} → {fmtDate(chosen[0].option.departure)} · {lastSearch.adults} adultos
              {lastSearch.children ? ` y ${lastSearch.children} niños` : ""}
            </p>
            {breakdown.voucher > 0 && (
              <p className="flex justify-between">
                <span>Descuento</span>
                <span>−{money.format(breakdown.voucher)}</span>
              </p>
            )}
            {breakdown.taxes > 0 && (
              <p className="flex justify-between">
                <span>Impuestos</span>
                <span>{money.format(breakdown.taxes)}</span>
              </p>
            )}
            <p className="flex items-baseline justify-between border-t border-neutral-300 pt-3">
              <span className="style-caption-xs">Total</span>
              <span className="style-heading text-2xl">
                {breakdown.originalSubtotal !== null && <s className="mr-2 text-base text-neutral-500">{money.format(breakdown.originalSubtotal)}</s>}
                {money.format(breakdown.total)}
              </span>
            </p>
            {!guestsFit && <p className="text-xs text-red-600">Las habitaciones elegidas no tienen plazas para todo el grupo.</p>}

            {[...new Set(chosen.flatMap((c) => c.option.periods.map((p) => p.rate_id)))].map((rateId) => {
              const rate = inventory.rates[String(rateId)];
              if (!rate?.cancellation && !rate?.payment) return null;
              return (
                <div key={rateId} className="grid gap-1 text-xs text-neutral-600">
                  <p className="font-normal text-black">{rate.name}</p>
                  {rate.cancellation && <p className="whitespace-pre-line">{rate.cancellation}</p>}
                  {rate.payment && <p className="whitespace-pre-line">{rate.payment}</p>}
                </div>
              );
            })}

            {inventory.consent && (
              <label className="flex items-start gap-2 text-xs">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
                <span className="whitespace-pre-line">
                  <strong className="font-normal">{inventory.consent.title}.</strong> {inventory.consent.text}
                </span>
              </label>
            )}
            {inventory.privacySummary && <p className="text-xs whitespace-pre-line text-neutral-500">{inventory.privacySummary}</p>}

            {viaWhatsApp ? (
              <>
                <button
                  type="submit"
                  disabled={!guestsFit}
                  className="style-button min-h-12 w-full justify-center !bg-[#25D366] !text-white disabled:opacity-60"
                >
                  <WhatsAppGlyph className="size-5" />
                  Solicitar reserva por WhatsApp
                </button>
                <p className="text-xs text-neutral-500">
                  Se abre WhatsApp con tu solicitud ya escrita (habitación, fechas y datos): solo tienes que enviarla. Te
                  confirmamos la disponibilidad por el mismo chat y todavía no se cobra nada. Al solicitar la reserva aceptas las{" "}
                  <TransitionLink href={site.legalLinks.terms.href} className="underline">
                    {site.legalLinks.terms.label}
                  </TransitionLink>
                  .
                </p>
              </>
            ) : (
              <>
                <button type="submit" disabled={paying || !guestsFit} className="style-button w-full justify-center disabled:opacity-60">
                  {paying
                    ? mode === "tpv"
                      ? "Creando tu reserva…"
                      : "Comprobando disponibilidad…"
                    : `${mode === "tpv" ? "Reservar y pagar" : "Pagar"} ${money.format(breakdown.total)}`}
                  <ArrowOut />
                </button>
                <p className="text-xs text-neutral-500">
                  {mode === "tpv"
                    ? "Volvemos a comprobar la disponibilidad y el precio, guardamos tu reserva y te llevamos al pago seguro con tarjeta de nuestro sistema de reservas. Tienes 30 minutos para pagar; si no, la reserva se anula sola."
                    : "Volvemos a comprobar la disponibilidad y el precio antes de cobrar. El pago se hace en Stripe y solo se cobra cuando la reserva queda confirmada."}{" "}
                  Al reservar aceptas las{" "}
                  <TransitionLink href={site.legalLinks.terms.href} className="underline">
                    {site.legalLinks.terms.label}
                  </TransitionLink>
                  .
                </p>
                <button
                  type="button"
                  onClick={requestByWhatsApp}
                  disabled={paying}
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[#25D366] text-sm text-black disabled:opacity-60"
                >
                  <WhatsAppGlyph className="size-4 text-[#25D366]" />
                  ¿Prefieres reservar por WhatsApp?
                </button>
              </>
            )}
            {checkoutErrors.length > 0 && (
              <ul role="alert" className="border border-red-400 p-3 text-xs">
                {checkoutErrors.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
