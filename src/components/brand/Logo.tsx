import type { CSSProperties } from "react";
import { GLYPHS, LAYOUTS } from "./logo-data";

/**
 * Logo de Enjoy Comfort (LOGOS.pdf): rombo con el monograma «EC» calado y
 * «ENJOY / COMFORT» en Avenir Book convertida a trazados.
 *
 * Es un SVG en línea (no un <img>) para que:
 *  - tome el color del texto (`tone`), sin un archivo por color;
 *  - se pueda animar por partes: el rombo gira hasta su sitio, las letras
 *    aparecen una a una y, si lleva dirección, el filete se dibuja
 *    (`animated`, ver `.ec-logo` en globals.css);
 *  - reaccione al pasar el ratón por el enlace que lo contiene.
 *
 * - `variant="full"`     horizontal: rombo a la izquierda, marca a la derecha.
 * - `variant="stacked"`  vertical: rombo arriba, marca centrada debajo.
 * - `variant="icon"`     solo el rombo.
 * - `address`            añade el filete y «C/ Nueva 5 - 1ºB / 20001 Donostia».
 */

type Props = {
  variant?: "full" | "stacked" | "icon";
  tone?: "dark" | "light";
  address?: boolean;
  animated?: boolean;
  className?: string;
  /** Texto alternativo; vacío = decorativo (el enlace ya lleva su nombre) */
  alt?: string;
};

/** viewBox de cada versión, medido sobre los trazados del PDF */
const VIEWBOX = {
  full: { brand: "33.17 199.07 141.54 57.7", address: "33.17 199.07 142.6 83.51" },
  stacked: { brand: "42.2 136.99 81.3 92.55", address: "42.2 136.99 81.3 131.61" },
  icon: { brand: "33.17 199.07 57.7 57.7", address: "33.17 199.07 57.7 57.7" },
} as const;

/** Negro de la marca (#231F20), no negro puro */
const TONES = { dark: "text-ink", light: "text-white" } as const;

export function Logo({ variant = "full", tone = "dark", address = false, animated = false, className = "", alt = "" }: Props) {
  const layout = LAYOUTS[variant === "stacked" ? "stacked" : "horizontal"];
  const withText = variant !== "icon";
  const withAddress = withText && address;
  let letterIndex = 0;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={VIEWBOX[variant][withAddress ? "address" : "brand"]}
      fill="currentColor"
      data-animated={animated || undefined}
      className={`ec-logo ${TONES[tone]} ${className}`}
      {...(alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true })}
    >
      <g className="ec-mark">
        {layout.mark.map((d) => (
          <path key={d.slice(0, 16)} d={d} />
        ))}
      </g>
      {withText &&
        layout.brand.map((line, l) => (
          <g key={l}>
            {line.map(([glyph, x, y]) => {
              const i = letterIndex++;
              return (
                <g key={`${glyph}-${x}`} transform={`translate(${x} ${y})`}>
                  <path className="ec-letter" style={{ "--i": i } as CSSProperties} d={GLYPHS[glyph]} />
                </g>
              );
            })}
          </g>
        ))}
      {withAddress && (
        <>
          <line
            className="ec-rule"
            x1={layout.rule[0]}
            x2={layout.rule[1]}
            y1={layout.rule[2]}
            y2={layout.rule[2]}
            stroke="currentColor"
            strokeWidth="0.43"
          />
          <g className="ec-address">
            {layout.address.flatMap((line) =>
              line.map(([glyph, x, y]) => <path key={`${glyph}-${x}-${y}`} transform={`translate(${x} ${y})`} d={GLYPHS[glyph]} />),
            )}
          </g>
        </>
      )}
    </svg>
  );
}
