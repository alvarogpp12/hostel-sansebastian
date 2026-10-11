/**
 * Prueba rápida de la conexión con Redforts. NO crea reservas.
 *
 *   npx tsx --conditions=react-server scripts/redforts-smoke.ts
 *   (o: npm run redforts:smoke)
 *
 * Hace falta `--conditions=react-server` porque el cliente lleva `server-only`.
 * Lee .env.local y llama a /inventory, /calendar_data y /availability para
 * dentro de 30 días, 2 noches, 1 adulto.
 */
import { existsSync } from "node:fs";
import { getAvailability, getCalendar, getInventory } from "../src/lib/redforts/api";
import { RedfortsError } from "../src/lib/redforts/client";
import { offerOptions } from "../src/lib/redforts/pricing";

const iso = (d: Date) => d.toISOString().slice(0, 10);
const plus = (n: number) => iso(new Date(Date.now() + n * 86_400_000));
const line = (s = "") => console.log(s);

async function main() {
  try {
    line("── /inventory ─────────────────────────────────────────");
    const inv = await getInventory();
    const lang = inv.languages.es ? "es" : inv.default_lang;
    line(`Versión ${inv.version} · idiomas: ${Object.keys(inv.languages).join(", ")} (por defecto ${inv.default_lang})`);
    line(`Entrada ${inv.checkin_from}${inv.checkin_to ? `–${inv.checkin_to}` : ""} · salida antes de ${inv.checkout} · niños: ${inv.allow_children ? "sí" : "no"}`);
    line(`Motor: https://booking.redforts.com/${inv.be_code}`);
    line("Alojamientos:");
    for (const [id, a] of Object.entries(inv.accos)) {
      line(`  [${id}] ${inv.languages[lang]?.accos[id]?.name ?? a.name} · ${a.amount} uds · ${a.adults} adultos + ${a.children} niños · ${a.images.length} fotos`);
    }
    line("Tarifas:");
    for (const [id, r] of Object.entries(inv.rates)) line(`  [${id}] ${inv.languages[lang]?.rates[id]?.name ?? r.name}`);
    line(`Campos: ${inv.fields.map((f) => `${f.id}${f.required ? "*" : ""}`).join(", ")}`);
    line(`Consentimiento: ${inv.languages[lang]?.consent_title ? "sí" : "no"} · promos: ${Object.keys(inv.promos).length}`);

    line();
    line("── /calendar_data ─────────────────────────────────────");
    const cal = await getCalendar();
    const count = (c: string) => [...cal.dates_info].filter((x) => x === c).length;
    line(`${cal.first_date} → ${cal.last_date} · días con llegada: ${count("1")} · libres sin llegada: ${count("0")} · completos: ${count("-")}`);
    line(`Próximos 30 días: ${cal.dates_info.slice(0, 30)}`);

    line();
    const arrival = plus(30);
    const departure = plus(32);
    line(`── /availability ${arrival} → ${departure}, 1 adulto ─────────`);
    const av = await getAvailability({ arrival, departure });
    const { options } = offerOptions(av.options ?? [], 1, 0);
    if (!options.length) line("Sin disponibilidad para esas fechas.");
    for (const o of options) {
      const rates = o.periods.map((p) => `${inv.languages[lang]?.rates[String(p.rate_id)]?.name ?? p.rate_id}×${p.days}`).join(" + ");
      const ota = Object.entries(o.ota_prices ?? {}).map(([k, v]) => `${k} ${v}`).join(", ");
      line(
        `  ${inv.languages[lang]?.accos[String(o.acco_id)]?.name ?? o.acco_id}: ${o.price} ${av.currency} · ${rates} · quedan ${o.amount}` +
          `${o.arrival !== arrival || o.departure !== departure ? ` · FECHAS ${o.arrival}→${o.departure}` : ""}` +
          `${o.prepayment_required ? " · prepago" : ""}${ota ? ` · OTAs: ${ota}` : ""}`,
      );
    }
    line();
    line("✅ Conexión correcta. No se ha creado ninguna reserva.");
  } catch (error) {
    if (error instanceof RedfortsError) {
      console.error(`❌ ${error.kind}${error.status ? ` (HTTP ${error.status})` : ""}: ${error.message}`);
    } else console.error("❌", error);
    process.exit(1);
  }
}

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
void main();
