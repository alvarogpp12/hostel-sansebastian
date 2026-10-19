/**
 * Redforts manda algunos textos del inventario (políticas de cancelación y
 * pago, descripciones, privacidad…) en HTML. La web los pinta como texto, así
 * que aquí se convierten a texto plano con saltos de línea: nunca se inyecta
 * su HTML en la página.
 */

const NAMED: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú",
  Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú",
  ntilde: "ñ", Ntilde: "Ñ", uuml: "ü", Uuml: "Ü", ccedil: "ç", Ccedil: "Ç",
  agrave: "à", egrave: "è", ograve: "ò", iexcl: "¡", iquest: "¿",
  euro: "€", ordm: "º", ordf: "ª", deg: "°", middot: "·", hellip: "…",
  laquo: "«", raquo: "»", ndash: "–", mdash: "—", lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”",
};

function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === "#") {
      const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : match;
    }
    return NAMED[code] ?? match;
  });
}

/** HTML → texto plano. Devuelve el texto tal cual si no lleva etiquetas ni entidades. */
export function htmlToText(input: string): string {
  if (!/[<&]/.test(input)) return input.trim();
  const text = input
    .replace(/\r\n?/g, "\n")
    .replace(/<\s*(script|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\s*li[^>]*>/gi, "\n• ")
    .replace(/<\s*\/\s*(p|div|h[1-6]|ul|ol|table|tr)\s*>/gi, "\n\n")
    .replace(/<\s*\/\s*li\s*>/gi, "")
    .replace(/<[^>]*>/g, "");
  return decodeEntities(text)
    .split("\n")
    .map((line) => line.replace(/[ \t ]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Igual que htmlToText, pero null/undefined/vacío → null */
export function cleanText(input: string | null | undefined): string | null {
  if (!input) return null;
  const text = htmlToText(input);
  return text === "" ? null : text;
}
