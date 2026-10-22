/**
 * Cuando Redforts devuelve una opción con otras fechas que las buscadas es
 * por sus restricciones (días sin llegadas y estancia mínima), que son las que
 * mandan. Este texto explica al huésped por qué sus fechas no están
 * disponibles, a partir de lo que ha cambiado.
 */

type Stay = { arrival: string; departure: string };

const dateFmt = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", timeZone: "UTC" });
const fmtDate = (iso: string) => dateFmt.format(new Date(`${iso}T00:00:00Z`));
const nights = (from: string, to: string) => Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);

export function datesNotice(search: Stay, offered: Stay): string {
  const reasons: string[] = [];
  if (offered.arrival !== search.arrival) reasons.push(`el ${fmtDate(search.arrival)} no se admiten llegadas`);
  if (offered.departure !== search.departure) {
    const n = nights(offered.arrival, offered.departure);
    reasons.push(`llegando el ${fmtDate(offered.arrival)}, la estancia mínima es de ${n} ${n === 1 ? "noche" : "noches"}`);
  }
  const why = reasons.join("; ");
  return `${why.charAt(0).toUpperCase()}${why.slice(1)}. Fechas disponibles: ${fmtDate(offered.arrival)} → ${fmtDate(offered.departure)}.`;
}
