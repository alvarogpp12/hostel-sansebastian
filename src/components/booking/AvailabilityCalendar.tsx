"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Selector de llegada y salida con la disponibilidad de /calendar_data:
 *  - "-": no hay nada libre ese día.
 *  - "0": hay algo libre pero no se puede llegar ese día.
 *  - "1": se puede llegar.
 * Dada una llegada, se puede salir hasta el primer "-" (incluido) o hasta el
 * día siguiente a `lastDate`. Las semanas empiezan el día después del último
 * día de fin de semana, para que el fin de semana quede a la derecha.
 */

export type CalendarData = {
  datesInfo: string;
  firstDate: string;
  lastDate: string;
  firstWeekendDay: number;
  lastWeekendDay: number;
};

const DAY = 86_400_000;
const toTime = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
const toIso = (t: number) => new Date(t).toISOString().slice(0, 10);
const addDays = (iso: string, n: number) => toIso(toTime(iso) + n * DAY);
const todayIso = () => {
  const d = new Date();
  return toIso(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
};

const monthFmt = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric", timeZone: "UTC" });
const weekdayFmt = new Intl.DateTimeFormat("es-ES", { weekday: "narrow", timeZone: "UTC" });

function charAt(cal: CalendarData, iso: string): string {
  if (iso < cal.firstDate || iso > cal.lastDate) return "-";
  return cal.datesInfo[Math.round((toTime(iso) - toTime(cal.firstDate)) / DAY)] ?? "-";
}

/** Última salida posible para una llegada */
export function maxDeparture(cal: CalendarData, arrival: string): string {
  let d = addDays(arrival, 1);
  while (d <= cal.lastDate) {
    if (charAt(cal, d) === "-") return d;
    d = addDays(d, 1);
  }
  return addDays(cal.lastDate, 1);
}

export function AvailabilityCalendar({
  arrival,
  departure,
  onChange,
}: {
  arrival: string | null;
  departure: string | null;
  onChange: (arrival: string | null, departure: string | null) => void;
}) {
  const [cal, setCal] = useState<CalendarData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState(() => todayIso().slice(0, 7));

  useEffect(() => {
    let alive = true;
    fetch("/api/redforts/calendar")
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.errors?.[0] ?? "No se pudo cargar el calendario.");
        return json as CalendarData;
      })
      .then((data) => {
        if (!alive) return;
        setCal(data);
        // Abre en el primer mes con alguna llegada posible
        const firstArrivalIdx = data.datesInfo.indexOf("1");
        const firstIso = firstArrivalIdx >= 0 ? addDays(data.firstDate, firstArrivalIdx) : data.firstDate;
        setMonth((m) => (firstIso.slice(0, 7) > m ? firstIso.slice(0, 7) : m));
      })
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, []);

  const weekStart = cal ? (cal.lastWeekendDay + 1) % 7 : 1;
  const today = todayIso();

  const days = useMemo(() => {
    const first = toTime(`${month}-01`);
    const firstDow = new Date(first).getUTCDay();
    const lead = (firstDow - weekStart + 7) % 7;
    const [y, m] = month.split("-").map(Number);
    const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
    return [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => toIso(first + i * DAY))] as (string | null)[];
  }, [month, weekStart]);

  const weekdays = Array.from({ length: 7 }, (_, i) => weekdayFmt.format(new Date(Date.UTC(2024, 0, 7 + ((weekStart + i) % 7)))));

  const choosingDeparture = Boolean(arrival && !departure);
  const limit = cal && arrival && choosingDeparture ? maxDeparture(cal, arrival) : null;

  const isEnabled = (iso: string) => {
    if (!cal || iso < today) return false;
    if (choosingDeparture && arrival && limit) return iso > arrival && iso <= limit;
    return charAt(cal, iso) === "1";
  };

  const pick = (iso: string) => {
    if (choosingDeparture && arrival && iso > arrival) onChange(arrival, iso);
    else onChange(iso, null);
  };

  const shift = (n: number) => {
    const [y, m] = month.split("-").map(Number);
    setMonth(toIso(Date.UTC(y, m - 1 + n, 1)).slice(0, 7));
  };

  if (error) return <p className="border border-red-400 p-3 text-xs">{error}</p>;

  return (
    <div className="grid w-full max-w-md gap-3" aria-busy={!cal}>
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => shift(-1)} disabled={month <= today.slice(0, 7)} className="px-2 py-1 disabled:opacity-30" aria-label="Mes anterior">
          ←
        </button>
        <p className="style-caption-xs !font-normal capitalize">{monthFmt.format(new Date(toTime(`${month}-01`)))}</p>
        <button type="button" onClick={() => shift(1)} className="px-2 py-1" aria-label="Mes siguiente">
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {weekdays.map((w, i) => (
          <span key={i} className="py-1 text-neutral-500 uppercase">
            {w}
          </span>
        ))}
        {days.map((iso, i) => {
          if (!iso) return <span key={`e${i}`} />;
          const enabled = isEnabled(iso);
          const inRange = arrival && departure && iso > arrival && iso < departure;
          const selected = iso === arrival || iso === departure;
          return (
            <button
              key={iso}
              type="button"
              disabled={!enabled}
              onClick={() => pick(iso)}
              aria-pressed={selected}
              aria-label={iso}
              className={`aspect-square rounded transition-colors ${
                selected
                  ? "bg-black text-white"
                  : inRange
                    ? "bg-neutral-200"
                    : enabled
                      ? "hover:bg-neutral-100"
                      : "cursor-not-allowed text-neutral-300 line-through"
              }`}
            >
              {Number(iso.slice(8))}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-neutral-500">
        {!cal ? "Cargando disponibilidad…" : choosingDeparture ? "Elige el día de salida." : "Elige el día de llegada."}
      </p>
    </div>
  );
}
