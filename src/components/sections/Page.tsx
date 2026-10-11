import type { ReactNode } from "react";
import { Icon } from "@/components/icons";
import { Reveal } from "@/components/Reveal";
import { TransitionLink } from "@/components/TransitionLink";
import { Frame } from "@/components/ui";
import { QuickSearch } from "@/components/booking/QuickSearch";
import type { Media } from "@/content/media";
import type { IconName } from "@/content/site";
import { site } from "@/content/site";

/*
 * Piezas comunes de todas las páginas, con el mismo lenguaje que la home:
 * cabecera partida (texto a la izquierda, foto a la derecha), secciones con el
 * mismo ritmo vertical, filas blancas, franjas con línea negra y el bloque de
 * reserva negro al final.
 */

/** id de la cabecera: la barra de reserva fija aparece cuando sale de pantalla */
export const PAGE_HERO_ID = "cabecera";

const headingScale = "style-heading text-3xl !leading-[1.05] text-balance sm:text-4xl xl:text-6xl";

/** Cabecera de página. Sin `image`, ocupa todo el ancho (páginas de texto). */
export function PageHero({
  eyebrow,
  title,
  intro,
  image,
  links,
}: {
  eyebrow?: string;
  title: string;
  intro?: string | string[];
  image?: Media;
  links?: { label: string; href: string }[];
}) {
  const paragraphs = intro === undefined ? [] : Array.isArray(intro) ? intro : [intro];
  return (
    <header id={PAGE_HERO_ID} className="px-w pt-24 lg:pt-32">
      <div className={image ? "grid gap-6 lg:grid-cols-12 lg:gap-w" : "grid"}>
        <div className={`flex flex-col justify-end gap-4 lg:gap-6 ${image ? "lg:col-span-5 lg:pb-2" : "max-w-4xl"}`}>
          {eyebrow && (
            <Reveal as="p" effect="fade" delay={0.3} className="style-caption text-neutral-600">
              {eyebrow}
            </Reveal>
          )}
          <Reveal as="h1" effect="split" delay={0.3} className={headingScale}>
            {title}
          </Reveal>
          {paragraphs.map((p) => (
            <p key={p.slice(0, 24)} className="max-w-[48ch] text-base text-neutral-700 lg:text-lg">
              {p}
            </p>
          ))}
          {links && (
            <nav aria-label="En esta página" className="flex flex-wrap gap-2 pt-1">
              {links.map((l) => (
                <TransitionLink
                  key={l.href}
                  href={l.href}
                  className="flex min-h-11 items-center rounded-full border border-neutral-400 px-4 text-sm transition-colors hover:border-black hover:bg-white"
                >
                  {l.label}
                </TransitionLink>
              ))}
            </nav>
          )}
        </div>
        {image && (
          <Frame
            image={image}
            priority
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="aspect-[16/10] lg:col-span-7 lg:aspect-auto lg:min-h-[480px]"
          />
        )}
      </div>
    </header>
  );
}

/** Cabecera corta para páginas de trámite (reserva, confirmación, textos legales) */
export function PageIntro({ eyebrow, title, intro }: { eyebrow?: string; title: string; intro?: ReactNode }) {
  return (
    <header className="grid max-w-4xl gap-3 px-w pt-24 pb-6 lg:gap-4 lg:pt-32 lg:pb-10">
      {eyebrow && <p className="style-caption text-neutral-600">{eyebrow}</p>}
      <Reveal as="h1" effect="split" delay={0.2} className="style-heading text-3xl !leading-[1.05] text-balance sm:text-4xl xl:text-5xl">
        {title}
      </Reveal>
      {intro && <div className="max-w-[60ch] text-base text-neutral-700 lg:text-lg">{intro}</div>}
    </header>
  );
}

/** Sección con el titular a la izquierda, igual en todas las páginas */
export function Section({
  id,
  eyebrow,
  title,
  text,
  aside,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  text?: string;
  /** Enlace o acción a la derecha del titular */
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 px-w pt-20 lg:pt-32">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 lg:mb-8">
        <div className="grid gap-2">
          {eyebrow && (
            <Reveal as="p" effect="delayedSplit" className="style-caption">
              {eyebrow}
            </Reveal>
          )}
          <Reveal as="h2" effect="delayedFade" className="style-heading text-2xl text-balance lg:text-4xl">
            {title}
          </Reveal>
          {text && <p className="max-w-[64ch] text-neutral-700">{text}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** Razones o características en columnas bajo una línea negra, sin tarjetas */
export function StripList({ items, columns = 3 }: { items: { icon: IconName; title: string; text: string }[]; columns?: 3 | 4 }) {
  return (
    <ul className={`grid gap-x-8 border-t border-black sm:grid-cols-2 ${columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
      {items.map((it) => (
        <li key={it.title} className="grid content-start gap-2 pt-6 max-sm:pb-2">
          <div className="flex items-center gap-2">
            <Icon name={it.icon} className="size-4 shrink-0" />
            <h3 className="style-heading text-lg lg:text-xl">{it.title}</h3>
          </div>
          <p className="text-sm text-neutral-700 lg:text-base">{it.text}</p>
        </li>
      ))}
    </ul>
  );
}

/** Foto y texto en una fila blanca, como las de las habitaciones */
export function MediaRow({ image, title, children }: { image: Media; title: string; children: ReactNode }) {
  return (
    <article className="grid overflow-clip rounded-lg bg-white md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <Frame image={image} sizes="(min-width: 768px) 40vw, 100vw" className="aspect-[16/10] !rounded-none md:aspect-auto md:min-h-80" />
      <div className="grid content-center gap-4 p-6 lg:p-12">
        <h3 className="style-heading text-xl text-balance lg:text-3xl">{title}</h3>
        <div className="grid max-w-[56ch] gap-4 text-neutral-700 lg:text-lg">{children}</div>
      </div>
    </article>
  );
}

/** Tarjetas con foto. La primera ocupa dos columnas en escritorio. */
export function ImageCards({ items }: { items: { title: string; text: string; image: Media; icon?: IconName }[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it, i) => (
        <li key={it.title} className={`overflow-clip rounded-lg bg-white ${i === 0 && items.length % 3 !== 0 ? "lg:col-span-2" : ""}`}>
          <Frame
            image={it.image}
            sizes={i === 0 ? "(min-width: 1024px) 66vw, (min-width: 640px) 50vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
            className="aspect-[16/10] !rounded-none"
          />
          <div className="grid gap-2 p-5 lg:p-6">
            <h3 className="style-heading flex items-center gap-2 text-lg lg:text-xl">
              {it.icon && <Icon name={it.icon} className="size-4 shrink-0" />}
              {it.title}
            </h3>
            <p className="text-sm text-neutral-700 lg:text-base">{it.text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Filas de información: titular a la izquierda, contenido a la derecha */
export function InfoRows({ rows }: { rows: { icon: IconName; title: string; body: ReactNode }[] }) {
  return (
    <div className="divide-y divide-neutral-200 overflow-clip rounded-lg bg-white">
      {rows.map((r) => (
        <div key={r.title} className="grid gap-3 p-6 lg:grid-cols-12 lg:gap-w lg:p-10">
          <h2 className="style-heading flex items-center gap-3 text-xl lg:col-span-4 lg:text-2xl">
            <Icon name={r.icon} className="size-5 shrink-0" />
            {r.title}
          </h2>
          <div className="grid gap-2 text-neutral-700 lg:col-span-8 lg:text-lg">{r.body}</div>
        </div>
      ))}
    </div>
  );
}

/** Cierre de página: reservar sin volver arriba (sustituye al antiguo CTA) */
export function BookingBand() {
  const { title, text } = site.cta;
  return (
    <section aria-labelledby="reserva-cierre" data-booking-band className="px-w pt-20 lg:pt-32">
      <div className="grid gap-6 rounded-lg bg-black p-5 text-white sm:p-8 lg:gap-10 lg:p-12">
        <div className="grid gap-3 lg:grid-cols-12 lg:items-end lg:gap-w">
          <div className="grid gap-3 lg:col-span-7">
            <p className="style-caption text-neutral-400">Reserva directa</p>
            <h2 id="reserva-cierre" className="style-heading text-2xl text-balance lg:text-4xl">
              {title}
            </h2>
          </div>
          <p className="text-neutral-300 lg:col-span-5 lg:text-lg">{text}</p>
        </div>
        <QuickSearch />
      </div>
    </section>
  );
}
