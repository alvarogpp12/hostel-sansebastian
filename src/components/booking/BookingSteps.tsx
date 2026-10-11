const STEPS = ["Fechas", "Habitación", "Tus datos y pago"];

/** Progreso de la reserva: el huésped sabe siempre cuánto le queda */
export function BookingSteps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol aria-label="Pasos de la reserva" className="grid grid-cols-3 gap-2">
      {STEPS.map((label, i) => {
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
