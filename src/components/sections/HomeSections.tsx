import { Arrow } from "@/components/icons";
import { Reveal } from "@/components/Reveal";
import { TransitionLink } from "@/components/TransitionLink";
import { Frame } from "@/components/ui";
import { QuickSearch } from "@/components/booking/QuickSearch";
import { home } from "@/content/home";
import { ImageCards, Section, StripList } from "./Page";
import { getRoomPhotos } from "@/lib/redforts/room-photos";
import { RoomRows } from "./RoomRows";

/**
 * Hero del embudo: a la izquierda el titular, a la derecha la bahía y, encima
 * de los dos, el buscador de fechas. Reservar empieza en el primer pantallazo.
 */
export function BookingHero() {
  const { h1, title, lead, image, trust } = home.hero;
  return (
    <section className="px-w pt-24 lg:pt-32">
      <div className="grid gap-5 lg:grid-cols-12 lg:gap-w">
        <div className="flex flex-col justify-center gap-4 lg:col-span-5 lg:gap-6 lg:pb-24">
          <Reveal as="h1" effect="fade" delay={0.3} className="style-caption text-neutral-600">
            {h1}
          </Reveal>
          <Reveal as="p" effect="split" delay={0.3} className="style-heading text-3xl !leading-[1.05] sm:text-4xl xl:text-6xl">
            {title[0]} <em>{title[1]}</em>
          </Reveal>
          <p className="max-w-[32ch] text-lg text-neutral-700 max-lg:hidden">{lead}</p>
        </div>
        <Frame
          image={image}
          priority
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="aspect-[16/10] lg:col-span-7 lg:aspect-auto lg:min-h-[560px] xl:min-h-[640px]"
        />
      </div>

      <div id="reserva-rapida" className="relative z-10 -mt-8 sm:px-4 lg:-mt-20 lg:px-0">
        <QuickSearch className="lg:max-w-5xl" />
        <ul className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-neutral-700 lg:mt-4 lg:justify-start lg:px-2 lg:text-sm">
          {trust.map((t) => (
            <li key={t} className="flex items-center gap-2">
              <Check />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export async function HomeRooms() {
  const { eyebrow, title, text } = home.rooms;
  const photos = await getRoomPhotos();
  return (
    <Section id="habitaciones" eyebrow={eyebrow} title={title} text={text}>
      {/* El mismo listado que /habitaciones: texto completo y galería de fotos */}
      <RoomRows detailed headingLevel="h3" photos={photos} />
    </Section>
  );
}

export function HomeFeatures() {
  const { title, items } = home.features;
  return (
    <Section id="por-que-elegirnos" title={title}>
      <StripList items={items} />
    </Section>
  );
}

export function HomeCity() {
  const { eyebrow, title, items } = home.city;
  return (
    <Section
      eyebrow={eyebrow}
      title={title}
      aside={
        <TransitionLink href="/ubicacion" className="flex items-center gap-2 text-sm underline">
          Ubicación y qué ver
          <Arrow />
        </TransitionLink>
      }
    >
      <ImageCards items={items} />
    </Section>
  );
}

export function HomeFaq() {
  const { title, items } = home.faq;
  return (
    <Section
      id="preguntas-frecuentes"
      title={title}
      aside={
        <TransitionLink href="/info-practica" className="flex items-center gap-2 text-sm underline">
          Información práctica
          <Arrow />
        </TransitionLink>
      }
    >
      <div className="divide-y divide-neutral-200 overflow-clip rounded-lg bg-white">
        {items.map((f) => (
          <details key={f.q} className="group">
            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-neutral-100 lg:px-8 [&::-webkit-details-marker]:hidden">
              <h3 className="style-heading text-base lg:text-xl">{f.q}</h3>
              <span aria-hidden="true" className="flex-center size-8 shrink-0 rounded-full border border-neutral-400 text-base leading-none">
                <span className="group-open:hidden">+</span>
                <span className="hidden group-open:inline">−</span>
              </span>
            </summary>
            <p className="max-w-[72ch] px-5 pb-6 text-neutral-700 lg:px-8 lg:text-lg">{f.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
