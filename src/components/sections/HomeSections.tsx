import { Arrow, Icon } from "@/components/icons";
import { Reveal } from "@/components/Reveal";
import { TransitionLink } from "@/components/TransitionLink";
import { Frame } from "@/components/ui";
import { QuickSearch } from "@/components/booking/QuickSearch";
import { home } from "@/content/home";
import { hasPrice, priceLabel, rooms } from "@/content/rooms";
import { site } from "@/content/site";
import { bookingHref } from "@/lib/booking-search";

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

/**
 * Habitaciones en filas comparables: foto, qué incluye y, a la derecha, precio
 * y botón de reservar con la habitación ya elegida.
 */
export function HomeRooms() {
  const { eyebrow, title, text } = home.rooms;
  return (
    <section id="habitaciones" className="px-w pt-20 lg:pt-32">
      <div className="mb-6 grid gap-2 lg:mb-8">
        <Reveal as="p" effect="delayedSplit" className="style-caption">
          {eyebrow}
        </Reveal>
        <Reveal as="h2" effect="delayedFade" className="style-heading text-xl lg:text-3xl">
          {title}
        </Reveal>
        <p className="max-w-[72ch]">{text}</p>
      </div>
      <ul className="grid gap-3">
        {rooms.map((room) => (
          <li key={room.id}>
            <article className="group grid overflow-clip rounded-lg bg-white md:grid-cols-[minmax(0,18rem)_1fr] lg:grid-cols-[22rem_1fr_17rem]">
              <Frame
                image={room.image}
                sizes="(min-width: 1024px) 22rem, (min-width: 768px) 18rem, 100vw"
                className="aspect-[16/10] !rounded-none md:row-span-2 md:aspect-auto md:min-h-60 lg:row-span-1"
                imgClassName="transition-transform duration-700 lg:group-hover:scale-105"
              />
              <div className="grid content-center gap-3 p-5 lg:p-8">
                <p className="style-caption-xs !font-light">{room.meta}</p>
                <h3 className="style-heading text-xl lg:text-2xl">{room.name}</h3>
                <p className="text-sm text-neutral-700 lg:text-base">{room.cardText}</p>
                <ul className="flex flex-wrap gap-x-5 gap-y-1.5 pt-1">
                  {room.specs.map((s) => (
                    <li key={s.text} className="flex items-center gap-2 text-xs lg:text-sm">
                      <Icon name={s.icon} className="size-4 shrink-0" />
                      {s.text}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 p-5 lg:flex-col lg:flex-nowrap lg:items-stretch lg:justify-center lg:border-t-0 lg:border-l lg:p-7">
                <p className="grid">
                  <span className="style-heading text-xl whitespace-nowrap lg:text-2xl">
                    {priceLabel(room)}
                    {hasPrice(room) && <span className="font-body text-xs tracking-normal">{site.ui.perNight}</span>}
                  </span>
                  {hasPrice(room) && <span className="text-xs text-neutral-500">Precio final al elegir fechas</span>}
                </p>
                <div className="grid gap-2 lg:w-full">
                  <TransitionLink
                    href={bookingHref({ room: room.id })}
                    className="style-button min-h-12 justify-center lg:!w-full"
                  >
                    Reservar esta
                    <Arrow />
                  </TransitionLink>
                  <TransitionLink href="/habitaciones" className="text-center text-xs underline max-lg:hidden">
                    Ver fotos y detalles
                  </TransitionLink>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Tres razones en una franja, sin tarjetas: se leen de un vistazo */
export function HomeFeatures() {
  const { title, items } = home.features;
  return (
    <section id="por-que-elegirnos" className="px-w pt-20 lg:pt-32">
      <h2 className="sr-only">{title}</h2>
      <div className="grid border-t border-black md:grid-cols-3">
        {items.map((f, i) => (
          <Reveal
            key={f.title}
            effect="delayedFade"
            className={`grid content-start gap-2 py-6 md:px-8 md:pb-0 ${i === 0 ? "md:pl-0" : "border-neutral-300 max-md:border-t md:border-l"}`}
          >
            <div className="flex items-center gap-2">
              <Icon name={f.icon} className="size-4" />
              <h3 className="style-heading text-lg lg:text-xl">{f.title}</h3>
            </div>
            <p className="text-sm text-neutral-700 lg:text-base">{f.text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function HomeCity() {
  const { eyebrow, title, items } = home.city;
  return (
    <section className="p-w pt-20 lg:pt-32">
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
