/* eslint-disable @next/next/no-img-element */

/**
 * Logo de Enjoy Comfort.
 *
 * Los archivos están en `public/brand/`. Se usan como <img> en vez de
 * next/image porque son SVG: pesan poco, escalan solos y, en el caso del
 * animado, sus animaciones CSS se ejecutan igual dentro de un <img>.
 *
 * - `variant="full"`  logotipo completo (símbolo + "enjoy comfort"), 550×140.
 * - `variant="icon"`  solo el símbolo, para el logo reducido al hacer scroll.
 * - `tone`            "dark" sobre fondos claros, "light" sobre fotos oscuras.
 */

type Props = {
  variant?: "full" | "icon";
  tone?: "dark" | "light";
  className?: string;
  /** Solo en el logotipo completo: usa la versión animada (25 KB comprimida) */
  animated?: boolean;
  alt?: string;
  priority?: boolean;
};

const FILES = {
  full: { dark: "/brand/logo-negro.svg", light: "/brand/logo-blanco.svg" },
  fullAnimated: { dark: "/brand/logo-negro-animado.svg", light: "/brand/logo-blanco-animado.svg" },
  icon: { dark: "/brand/icono-negro.svg", light: "/brand/icono-blanco.svg" },
} as const;

export function Logo({ variant = "full", tone = "dark", className, animated = false, alt = "", priority }: Props) {
  const src = variant === "icon" ? FILES.icon[tone] : animated ? FILES.fullAnimated[tone] : FILES.full[tone];
  const [width, height] = variant === "icon" ? [112, 112] : [550, 140];

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      draggable={false}
      {...(priority ? { fetchPriority: "high" as const } : { loading: "lazy" as const })}
      {...(alt === "" ? { "aria-hidden": true } : {})}
    />
  );
}
