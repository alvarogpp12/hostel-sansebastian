"use client";

import Form from "next/form";
import { useEffect, useState, type FormEvent } from "react";
import { Arrow } from "@/components/icons";
import { AvailabilityCalendar } from "@/components/booking/AvailabilityCalendar";
import { MAX_ADULTS, nightsBetween, SEARCH_PARAMS } from "@/lib/booking-search";

const dateFmt = new Intl.DateTimeFormat("es-ES", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const fmt = (iso: string) => dateFmt.format(new Date(`${iso}T00:00:00Z`));

/**
 * Buscador de la home: llegada, salida y personas. Envía un GET a /reservar
 * con las fechas en la URL, y la página de reserva consulta la disponibilidad
 * nada más abrirse.
 *
 * Las fechas se eligen en el calendario de disponibilidad de Redforts (el
 * mismo de /reservar), que tacha los días sin habitaciones: así nadie busca
 * fechas imposibles. En el móvil se abre como hoja desde abajo.
 */
export function QuickSearch({ className = "" }: { className?: string }) {
  const [arrival, setArrival] = useState<string | null>(null);
  const [departure, setDeparture] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Escape cierra el calendario
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    if (arrival && departure) return;
    e.preventDefault();
    setOpen(true);
  };

  const nights = arrival && departure ? nightsBetween(arrival, departure) : 0;
  const label = "style-caption-xs block !font-medium text-neutral-600";
  const value = "mt-1 block w-full bg-transparent text-left font-serif text-lg outline-none lg:text-2xl";
  const cell = "cursor-pointer rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-neutral-100 lg:px-5 lg:py-3";

  return (
    <>
      <Form
        action="/reservar"
        onSubmit={onSubmit}
        aria-label="Buscar disponibilidad"
        className={`grid grid-cols-2 gap-1 rounded-2xl bg-white p-1.5 text-black shadow-[0_20px_50px_rgba(0,0,0,0.12)] lg:grid-cols-[1fr_1fr_0.8fr_auto] lg:p-2 ${className}`}
      >
        {arrival && <input type="hidden" name={SEARCH_PARAMS.arrival} value={arrival} />}
        {departure && <input type="hidden" name={SEARCH_PARAMS.departure} value={departure} />}
        <button type="button" onClick={() => setOpen(true)} className={cell} aria-haspopup="dialog">
          <span className={label}>Llegada</span>
          <span className={`${value} ${arrival ? "" : "text-neutral-400"}`}>{arrival ? fmt(arrival) : "Elegir"}</span>
        </button>
        <button type="button" onClick={() => setOpen(true)} className={`${cell} border-l border-neutral-200`} aria-haspopup="dialog">
          <span className={label}>Salida{nights > 0 && ` · ${nights === 1 ? "1 noche" : `${nights} noches`}`}</span>
          <span className={`${value} ${departure ? "" : "text-neutral-400"}`}>{departure ? fmt(departure) : "Elegir"}</span>
        </button>
        <label className="col-span-2 flex cursor-pointer items-center justify-between gap-3 rounded-xl border-t border-neutral-200 px-3 py-2.5 transition-colors hover:bg-neutral-100 lg:col-span-1 lg:block lg:border-t-0 lg:border-l lg:px-5 lg:py-3">
          <span className={label}>Personas</span>
          <select name={SEARCH_PARAMS.adults} defaultValue="2" className={`${value} max-lg:mt-0 max-lg:w-auto max-lg:text-right`}>
            {Array.from({ length: MAX_ADULTS }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n === 1 ? "1 adulto" : `${n} adultos`}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="style-button col-span-2 mt-1 !w-full min-h-13 whitespace-nowrap justify-center !rounded-xl !text-sm lg:col-span-1 lg:mt-0 lg:!w-auto lg:px-8"
        >
          Ver habitaciones libres
          <Arrow />
        </button>
      </Form>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 lg:items-center" onClick={() => setOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Elige tus fechas"
            data-lenis-prevent
            onClick={(e) => e.stopPropagation()}
            className="grid max-h-[90dvh] w-full max-w-md gap-4 overflow-y-auto rounded-t-2xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-black lg:rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <p className="style-heading text-xl">
                {arrival ? fmt(arrival) : "Llegada"} → {departure ? fmt(departure) : "Salida"}
              </p>
              <button type="button" onClick={() => setOpen(false)} className="px-2 py-1 text-xl" aria-label="Cerrar">
                ×
              </button>
            </div>
            <AvailabilityCalendar
              arrival={arrival}
              departure={departure}
              onChange={(a, d) => {
                setArrival(a);
                setDeparture(d);
              }}
            />
            <button
              type="button"
              disabled={!arrival || !departure}
              onClick={() => setOpen(false)}
              className="style-button min-h-12 w-full justify-center disabled:opacity-40"
            >
              {arrival && departure ? `Listo · ${nights === 1 ? "1 noche" : `${nights} noches`}` : "Elige llegada y salida"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
