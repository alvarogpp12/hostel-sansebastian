import Image from "next/image";
import { Arrow, Icon } from "@/components/icons";
import { Reveal } from "@/components/Reveal";
import { TransitionLink } from "@/components/TransitionLink";
import { Frame } from "@/components/ui";
import { home } from "@/content/home";
import { hasPrice, priceLabel, rooms } from "@/content/rooms";
import { site } from "@/content/site";
import { HeroSlider } from "./HeroSlider";

/**
 * Sales funnel hero: San Sebastián photo slider with the room booking cards
 * on top. Each card goes straight to the booking form with the room chosen.
 */
export function BookingHero() {
  const { h1, title, slides, cardsLabel } = home.hero;
  return (
    <section className="relative isolate bg-neutral-900 text-white lg:flex lg:h-svh lg:min-h-[760px] lg:flex-col lg:justify-end">
      <div className="absolute inset-x-0 top-0 -z-20 aspect-[5/7] max-h-[88svh] w-full lg:inset-0 lg:aspect-auto lg:max-h-none lg:size-full">
        <HeroSlider slides={slides} priority paginationClassName="!bottom-auto !top-24 lg:!top-28" />
        {/* Refuerza el contraste del titular sobre fotos claras (playa, arena) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-2/3 bg-gradient-to-t from-neutral-900/85 via-neutral-900/45 to-transparent" />
      </div>

      <div className="flex min-h-[70svh] flex-col justify-end gap-2 p-w pt-32 lg:min-h-0 lg:pt-0">
        <Reveal as="h1" effect="delayedFade" delay={0.85} className="style-caption">
          {h1}
        </Reveal>
        <Reveal as="p" effect="delayedSplit" delay={0.85} className="style-heading text-2xl sm:text-3xl lg:text-4xl">
          {title[0]} <br />
          {title[1]}
        </Reveal>
      </div>

      <div className="px-w pb-w lg:pt-6">
        <p className="sr-only">{cardsLabel}</p>
        <Reveal
          as="ul"
          effect="fade"
          delay={1.1}
          className="-mx-w flex snap-x snap-mandatory gap-2 overflow-x-auto px-w pb-1 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0"
        >
          {rooms.map((room) => (
            <li key={room.id} className="w-[86%] shrink-0 snap-start sm:w-[48%] lg:w-auto">
              <TransitionLink
                href={`/reservar?habitacion=${room.id}`}
                className="group flex h-full gap-3 rounded-lg border border-neutral-300 bg-white p-2 text-black transition-colors duration-500 lg:hover:bg-neutral-100"
              >
                <div className="relative aspect-[5/6] w-24 shrink-0 overflow-clip rounded-lg bg-neutral-200 lg:aspect-square lg:w-32">
                  <Image
                    src={room.image.src}
                    alt={room.image.alt}
                    fill
                    sizes="128px"
                    className="object-cover transition-transform duration-500 lg:group-hover:scale-110"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1 p-1">
                  <h2 className="style-heading text-lg leading-tight lg:text-xl">{room.short}</h2>
                  <p className="style-caption-xs !font-light">{room.meta}</p>
                  <p className="mt-auto flex flex-wrap items-end justify-between gap-x-2 gap-y-3 pt-2">
                    <span className="style-heading text-lg whitespace-nowrap lg:text-xl">
                      {priceLabel(room)}
                      {hasPrice(room) && <span className="font-body text-xs tracking-normal">{site.ui.perNight}</span>}
                    </span>
                    <span className="style-button !px-3 !py-2 max-lg:ml-auto group-hover:gap-3">
                      {site.ui.book}
                      <Arrow />
                    </span>
                  </p>
                </div>
              </TransitionLink>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export function HomeIntro() {
  const { eyebrow, paragraphs } = home.intro;
  return (
    <section className="px-w pt-24 pb-32">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6">
        <Reveal as="h2" effect="delayedSplit" className="style-caption text-center">
          {eyebrow}
        </Reveal>
        <Reveal effect="delayedFade" className="style-heading grid gap-4 text-center text-lg !leading-snug 2xs:text-xl lg:text-3xl">
          {paragraphs.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export function RoomsHeading() {
  return (
    <div className="grid gap-2 bg-white px-w pt-16 lg:pt-24">
      <Reveal as="p" effect="delayedSplit" className="style-caption">
        {home.rooms.eyebrow}
      </Reveal>
      <Reveal as="h2" effect="delayedFade" className="style-heading text-xl lg:text-3xl">
        {home.rooms.title}
      </Reveal>
      <Reveal as="p" effect="delayedFade" className="max-w-[72ch]">
        {home.rooms.text}
      </Reveal>
    </div>
  );
}

export function HomeFeatures() {
  const { title, items } = home.features;
  return (
    <section id="por-que-elegirnos" className="p-w">
      <div className="grid gap-12 rounded-lg bg-white p-6 lg:p-w">
        <Reveal as="h2" effect="delayedSplit" className="style-heading text-xl lg:text-3xl">
          {title}
        </Reveal>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-w">
          {items.map((f) => (
            <div key={f.title} className="grid h-fit gap-2">
              <Reveal effect="delayedFade" className="h-[0.5px] w-full bg-current" />
              <div className="flex items-center gap-2">
                <Reveal effect="delayedFade" className="flex">
                  <Icon name={f.icon} className="size-4" />
                </Reveal>
                <Reveal as="h3" effect="delayedSplit" className="style-heading text-base">
                  {f.title}
                </Reveal>
              </div>
              <Reveal as="p" effect="delayedFade" className="text-sm">
                {f.text}
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeCity() {
  const { eyebrow, title, items } = home.city;
  return (
    <section className="p-w max-lg:py-8">
      <div className="grid gap-w lg:gap-6">
        <div className="flex items-end justify-between gap-4">
          <div className="grid gap-2">
            <Reveal as="p" effect="delayedSplit" className="style-caption">
              {eyebrow}
            </Reveal>
            <Reveal as="h2" effect="delayedFade" className="style-heading max-w-[72ch] text-xl lg:text-3xl">
              {title}
            </Reveal>
          </div>
          <TransitionLink href="/ubicacion" className="flex shrink-0 items-center gap-2 max-sm:hidden">
            <span className="style-caption !text-xs !font-light underline">Ver ubicación y qué hacer en San Sebastián</span>
            <Arrow />
          </TransitionLink>
        </div>
        <div className="grid gap-2 lg:grid-cols-4">
          {items.map((c) => (
            <Reveal key={c.title} effect="delayedFade" className="flex h-fit gap-2 rounded-lg border border-neutral-300 bg-white p-2 lg:grid">
              <Frame
                image={c.image}
                sizes="(min-width: 1024px) 25vw, 96px"
                className="aspect-[5/6] flex-shrink-0 max-lg:h-fit max-lg:w-24 lg:aspect-[6/4] lg:w-full"
              />
              <div className="flex min-h-28 flex-col items-start gap-2 p-2">
                <h3 className="style-heading text-base">{c.title}</h3>
                <p className="text-sm">{c.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeFaq() {
  const { title, items } = home.faq;
  return (
    <section id="preguntas-frecuentes" className="mx-auto my-14 grid max-w-4xl gap-6 px-w">
      <Reveal as="h2" effect="delayedSplit" className="style-heading text-xl lg:text-3xl">
        {title}
      </Reveal>
      <div className="grid gap-2">
        {items.map((f) => (
          <details key={f.q} className="group rounded-lg bg-white p-4 lg:px-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
              <h3 className="style-heading text-base lg:text-lg">{f.q}</h3>
              <span className="style-button !px-3 !py-2" aria-hidden="true">
                <span className="text-base leading-none group-open:hidden">+</span>
                <span className="hidden text-base leading-none group-open:inline">−</span>
              </span>
            </summary>
            <p className="max-w-[64ch] pt-4 text-sm lg:text-base">{f.a}</p>
          </details>
        ))}
      </div>
      <Reveal effect="delayedFade">
        <TransitionLink href="/info-practica" className="flex w-fit items-center gap-2 transition-all lg:hover:gap-3">
          <span className="style-caption !text-xs underline">Ver información práctica</span>
          <Arrow />
        </TransitionLink>
      </Reveal>
    </section>
  );
}
