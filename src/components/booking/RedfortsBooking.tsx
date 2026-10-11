"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { startCheckout } from "@/app/reservar/actions";
import { ArrowOut } from "@/components/icons";
import { TransitionLink } from "@/components/TransitionLink";
import type { PublicInventory } from "@/lib/redforts/inventory";
import { assignGuests, bestOtaSaving, priceSelection, type OfferedOption } from "@/lib/redforts/pricing";
import { site } from "@/content/site";
import { AvailabilityCalendar } from "./AvailabilityCalendar";

/**
 * Reserva nativa con la Booking API de Redforts (BOOKING_PROVIDER=redforts):
 *   1. Fechas (calendario con disponibilidad), personas y código promocional.
 *   2. Opciones de /availability: nombre, fotos y textos del inventario,
 *      precio (tachado si hay promo) y comparativa con las OTAs.
 *   3. Datos del huésped generados desde `fields` del inventario.
 *   4. Pago con Stripe (Server Action). Los precios que se ven aquí son solo
 *      informativos: el servidor los vuelve a pedir a Redforts antes de cobrar.
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

const dateFmt = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", timeZone: "UTC" });
const fmtDate = (iso: string) => dateFmt.format(new Date(`${iso}T00:00:00Z`));
const nightsBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

export function RedfortsBooking({ inventory }: { inventory: PublicInventory }) {
  const [arrival, setArrival] = useState<string | null>(null);
  const [departure, setDeparture] = useState<string | null>(null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [promo, setPromo] = useState("");

  const [results, setResults] = useState<Results | null>(null);
  const [searching, setSearching] = useState(false);
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

  const money = useMemo(
    () => new Intl.NumberFormat("es-ES", { style: "currency", currency: results?.currency ?? "EUR" }),
    [results?.currency],
  );

  const search = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!arrival || !departure) return;
    setSearching(true);
    setSearchErrors([]);
    setSelection({});
    setCheckoutErrors([]);
    const params = new URLSearchParams({ arrival, departure, adults: String(adults), children: String(children) });
    if (promo.trim()) params.set("promo", promo.trim());
    try {
      const res = await fetch(`/api/redforts/availability?${params}`);
      const json = await res.json();
      if (!res.ok) {
        setResults(null);
        setSearchErrors(json.errors ?? ["No se pudo consultar la disponibilidad."]);
        return;
      }
      setResults(json as Results);
      setLastSearch({ arrival, departure, adults, children, promo: promo.trim() || undefined });
    } catch {
      setSearchErrors(["No se pudo conectar con el sistema de reservas."]);
    } finally {
      setSearching(false);
    }
  };

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
  };

  const pay = (e: FormEvent) => {
    e.preventDefault();
    if (!lastSearch || !breakdown) return;
    setCheckoutErrors([]);
    setFieldErrors({});
    startPaying(async () => {
      const res = await startCheckout({
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
      if (res.newTotal !== undefined) await search();
    });
  };

  const byAcco = useMemo(() => {
    const map = new Map<number, OfferedOption[]>();
    for (const o of results?.options ?? []) map.set(o.acco_id, [...(map.get(o.acco_id) ?? []), o]);
    return [...map.entries()];
  }, [results]);

  return (
    <div className="grid gap-10">
      {/* ── 1. Búsqueda ─────────────────────────────────────────────── */}
      <form onSubmit={search} className="grid items-start gap-w text-sm lg:grid-cols-2">
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
                {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
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
          <label className="field">
            <span className="style-caption-xs block !font-light">Código promocional (opcional)</span>
            <input value={promo} onChange={(e) => setPromo(e.target.value)} maxLength={40} className="mt-1 w-full" autoComplete="off" />
          </label>
          <button type="submit" disabled={!arrival || !departure || searching} className="style-button w-full justify-center disabled:opacity-60">
            {searching ? "Buscando…" : "Ver disponibilidad y precios"}
            <ArrowOut />
          </button>
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
        <section aria-label="Habitaciones disponibles" className="grid gap-4">
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
            const img = acco?.images[0];
            return (
              <article key={accoId} className="grid gap-4 rounded-lg border border-neutral-300 p-2 md:grid-cols-[12rem_1fr]">
                <div className="relative aspect-[4/3] overflow-clip rounded-lg bg-neutral-200 md:aspect-auto">
                  {img && (
                    // Las fotos vienen de Redforts (booking.redforts.com): sin optimizar para no
                    // depender de remotePatterns.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img.thumb || img.url} alt={img.alt} className="absolute inset-0 size-full object-cover" loading="lazy" />
                  )}
                </div>
                <div className="grid gap-3 p-2">
                  <div className="grid gap-1">
                    <h3 className="style-heading text-lg lg:text-xl">{acco?.name ?? `Alojamiento ${accoId}`}</h3>
                    {acco?.description && <p className="text-sm text-neutral-600">{acco.description}</p>}
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
                                Fechas propuestas: {fmtDate(o.arrival)} → {fmtDate(o.departure)} (estancia mínima o días de llegada)
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

      {/* ── 3. Datos y pago ─────────────────────────────────────────── */}
      {breakdown && lastSearch && (
        <form onSubmit={pay} className="grid gap-6 border-t border-neutral-300 pt-8 text-sm lg:grid-cols-2 lg:gap-w">
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
                <span>
                  <strong className="font-normal">{inventory.consent.title}.</strong> {inventory.consent.text}
                </span>
              </label>
            )}
            {inventory.privacySummary && <p className="text-xs whitespace-pre-line text-neutral-500">{inventory.privacySummary}</p>}

            <button type="submit" disabled={paying || !guestsFit} className="style-button w-full justify-center disabled:opacity-60">
              {paying ? "Comprobando disponibilidad…" : `Pagar ${money.format(breakdown.total)}`}
              <ArrowOut />
            </button>
            <p className="text-xs text-neutral-500">
              Volvemos a comprobar la disponibilidad y el precio antes de cobrar. El pago se hace en Stripe y solo se cobra
              cuando la reserva queda confirmada. Al reservar aceptas las{" "}
              <TransitionLink href={site.legalLinks.terms.href} className="underline">
                {site.legalLinks.terms.label}
              </TransitionLink>
              .
            </p>
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
