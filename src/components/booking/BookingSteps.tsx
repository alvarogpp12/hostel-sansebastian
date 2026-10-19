const STEPS = ["Fechas", "Habitación", "Tus datos y pago"];

/** Progreso de la reserva: el huésped sabe siempre cuánto le queda */
export function BookingSteps({ current, lastLabel }: { current: 1 | 2 | 3; lastLabel?: string }) {
  const steps = lastLabel ? [...STEPS.slice(0, -1), lastLabel] : STEPS;
  return (
    <ol aria-label="Pasos de la reserva" className="grid grid-cols-3 gap-2">
      {steps.map((label, i) => {
        const n = i + 1;
        const state = n < current ? "done" : n === current ? "current" : "todo";
        return (
          <li key={label} aria-current={state === "current" ? "step" : undefined} className="grid gap-2">
            <span className={`h-[3px] rounded-full transition-colors duration-500 ${state === "todo" ? "bg-neutral-200" : "bg-black"}`} />
            <span className={`style-caption-xs !font-light ${state === "todo" ? "text-neutral-500" : ""}`}>
              <span className="max-sm:sr-only">{n}. </span>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
