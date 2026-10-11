"use client";

import { useState, useTransition, type FormEvent } from "react";
import { ArrowOut } from "@/components/icons";
import { lookupReservation, saveItems, type ReservationView } from "./actions";

const dateFmt = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const fmtDate = (iso: string) => (iso ? dateFmt.format(new Date(`${iso}T00:00:00Z`)) : "—");

export function MyReservation() {
  const [query, setQuery] = useState({ reserv_id: "", arrival: "", email: "" });
  const [reservation, setReservation] = useState<ReservationView | null>(null);
  const [qty, setQty] = useState<Record<number, number>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  const show = (r: ReservationView) => {
    setReservation(r);
    setQty(Object.fromEntries(r.items.map((i) => [i.id, i.quantity])));
  };

  const lookup = (e: FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSaved(false);
    start(async () => {
      const res = await lookupReservation(query);
      if (res.ok) show(res.reservation);
      else {
        setReservation(null);
        setErrors(res.errors);
      }
    });
  };

  const save = () => {
    if (!reservation) return;
    const items = reservation.items.filter((i) => qty[i.id] !== i.quantity).map((i) => ({ id: i.id, quantity: qty[i.id] }));
    if (!items.length) return;
    setErrors([]);
    setSaved(false);
    start(async () => {
      const res = await saveItems({ ...query, items });
      if (res.ok) {
        show(res.reservation);
        setSaved(true);
      } else setErrors(res.errors);
    });
  };

  const money = new Intl.NumberFormat("es-ES", { style: "currency", currency: reservation?.currency ?? "EUR" });

  return (
    <div className="grid gap-10 text-sm">
      <form onSubmit={lookup} className="grid gap-2.5 sm:grid-cols-3 sm:items-end">
        <label className="field">
          <span className="style-caption-xs block !font-light">Nº de reserva</span>
          <input required inputMode="numeric" pattern="[0-9]+" value={query.reserv_id} onChange={(e) => setQuery({ ...query, reserv_id: e.target.value })} className="mt-1 w-full" />
        </label>
        <label className="field">
          <span className="style-caption-xs block !font-light">Fecha de llegada</span>
          <input required type="date" value={query.arrival} onChange={(e) => setQuery({ ...query, arrival: e.target.value })} className="mt-1 w-full" />
        </label>
        <label className="field">
          <span className="style-caption-xs block !font-light">Email de la reserva</span>
          <input required type="email" autoComplete="email" value={query.email} onChange={(e) => setQuery({ ...query, email: e.target.value })} className="mt-1 w-full" />
        </label>
        <button type="submit" disabled={pending} className="style-button w-fit disabled:opacity-60 sm:col-span-3">
          {pending && !reservation ? "Buscando…" : "Ver mi reserva"}
          <ArrowOut />
        </button>
      </form>

      {errors.length > 0 && (
        <ul role="alert" className="border border-red-400 p-3 text-xs">
          {errors.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )}

      {reservation && (
        <section className="grid gap-6 border-t border-neutral-300 pt-8 lg:grid-cols-2 lg:gap-w">
          <div className="grid content-start gap-2">
            <h2 className="style-heading text-xl">Reserva nº {reservation.reservId}</h2>
            <p>
              {fmtDate(reservation.arrival)} → {fmtDate(reservation.departure)}
            </p>
            {reservation.name && <p>{reservation.name}</p>}
            <p className="text-xs text-neutral-500">Estado: {reservation.status === "confirmed" ? "confirmada" : "pendiente de confirmar"}</p>
            <ul className="mt-2 grid gap-1">
              {reservation.accos.map((a, i) => (
                <li key={i} className="flex justify-between gap-4">
                  <span>
                    {a.name} · {a.adults + a.children} {a.adults + a.children === 1 ? "persona" : "personas"}
                  </span>
                  <span>{money.format(a.price)}</span>
                </li>
              ))}
            </ul>
            {reservation.url && (
              <a className="mt-2 w-fit underline" href={reservation.url} target="_blank" rel="noopener noreferrer">
                Abrir en el portal del huésped
              </a>
            )}
          </div>

          {reservation.items.length > 0 && (
            <div className="grid content-start gap-3">
              <h2 className="style-heading text-xl">Extras</h2>
              <ul className="grid gap-2">
                {reservation.items.map((i) => (
                  <li key={i.id} className="flex items-center justify-between gap-4 border-t border-neutral-200 pt-2">
                    <span className="grid">
                      <span>{i.name}</span>
                      {i.description && <span className="text-xs text-neutral-500">{i.description}</span>}
                      <span className="text-xs text-neutral-500">
                        {money.format(i.price)}
                        {i.daily ? ` por día (${reservation.days} días)` : ""}
                      </span>
                    </span>
                    <select
                      aria-label={`Cantidad de ${i.name}`}
                      value={qty[i.id] ?? 0}
                      onChange={(e) => setQty({ ...qty, [i.id]: Number(e.target.value) })}
                      className="rounded border border-neutral-300 bg-transparent px-2 py-1"
                    >
                      {Array.from({ length: i.max - i.min + 1 }, (_, n) => i.min + n).map((n) => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={save} disabled={pending} className="style-button w-fit disabled:opacity-60">
                {pending ? "Guardando…" : "Guardar extras"}
              </button>
              {saved && <p className="text-xs text-green-700">Extras actualizados. Recibirás un email con los cambios.</p>}
              <p className="text-xs text-neutral-500">Los extras se pagan en el alojamiento.</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
