"use client";

import Form from "next/form";
import { useRef, useState, useSyncExternalStore } from "react";
import { Arrow } from "@/components/icons";
import { addDays, localToday, MAX_ADULTS, nightsBetween, SEARCH_PARAMS } from "@/lib/booking-search";

const noop = () => () => {};

/**
 * Buscador de la home: llegada, salida y personas en una fila. Envía un GET a
 * /reservar con las fechas en la URL, y la página de reserva consulta la
 * disponibilidad nada más abrirse. Funciona sin JavaScript (formulario normal).
 *
 * Usa los selectores de fecha nativos: en el móvil son los más rápidos y ya
 * los conoce todo el mundo. Al elegir la llegada se abre directamente el de
 * la salida.
 */
export function QuickSearch({ className = "" }: { className?: string }) {
  // Hoy se calcula en el navegador (su zona horaria); en el servidor no hay mínimo
  const today = useSyncExternalStore(noop, localToday, () => undefined);
  const [arrival, setArrival] = useState("");
  const [departure, setDeparture] = useState("");
  const departureRef = useRef<HTMLInputElement>(null);

  const onArrival = (value: string) => {
    setArrival(value);
    if (!value) return;
    if (!departure || departure <= value) setDeparture(addDays(value, 1));
    try {
      departureRef.current?.showPicker?.();
    } catch {
      // Sin activación de usuario o navegador sin showPicker: no pasa nada
    }
  };

  const nights = arrival && departure ? nightsBetween(arrival, departure) : 0;
  const label = "style-caption-xs block !font-medium text-neutral-600";
  const input = "mt-1 w-full bg-transparent font-serif text-lg outline-none lg:text-2xl";

  return (
    <Form
      action="/reservar"
      aria-label="Buscar disponibilidad"
      className={`grid grid-cols-2 gap-1 rounded-2xl bg-white p-1.5 text-black shadow-[0_20px_50px_rgba(0,0,0,0.12)] lg:grid-cols-[1fr_1fr_0.8fr_auto] lg:p-2 ${className}`}
    >
      <label className="cursor-pointer rounded-xl px-3 py-2.5 transition-colors hover:bg-neutral-100 lg:px-5 lg:py-3">
        <span className={label}>Llegada</span>
        <input
          type="date"
          name={SEARCH_PARAMS.arrival}
          required
          min={today}
          value={arrival}
          onChange={(e) => onArrival(e.target.value)}
          className={input}
        />
      </label>
      <label className="cursor-pointer rounded-xl border-l border-neutral-200 px-3 py-2.5 transition-colors hover:bg-neutral-100 lg:px-5 lg:py-3">
        <span className={label}>Salida{nights > 0 && ` · ${nights === 1 ? "1 noche" : `${nights} noches`}`}</span>
        <input
          ref={departureRef}
          type="date"
          name={SEARCH_PARAMS.departure}
          required
          min={arrival ? addDays(arrival, 1) : today}
          value={departure}
          onChange={(e) => setDeparture(e.target.value)}
          className={input}
        />
      </label>
      <label className="col-span-2 flex cursor-pointer items-center justify-between gap-3 rounded-xl border-t border-neutral-200 px-3 py-2.5 transition-colors hover:bg-neutral-100 lg:col-span-1 lg:block lg:border-t-0 lg:border-l lg:px-5 lg:py-3">
        <span className={label}>Personas</span>
        <select name={SEARCH_PARAMS.adults} defaultValue="2" className={`${input} max-lg:mt-0 max-lg:w-auto max-lg:text-right`}>
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
  );
}
