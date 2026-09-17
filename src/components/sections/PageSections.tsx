"use client";

import Image from "next/image";
import { useCallback, useState, type ReactNode } from "react";
import { Arrow, Icon } from "@/components/icons";
import { Reveal } from "@/components/Reveal";
import { TransitionLink } from "@/components/TransitionLink";
import { Frame } from "@/components/ui";
import type { Media } from "@/content/media";
import type { IconCard, ImageCard } from "@/content/pages";
import { hasPrice, priceLabel, type Room } from "@/content/rooms";
import { site } from "@/content/site";
import { GalleryModal } from "./GalleryModal";

/** Title + intro + "quick nav" pills (Espacios, Habitaciones) */
export function PageHeader({ title, intro, quickNav }: { title: string; intro: string; quickNav: { label: string; href: string }[] }) {
  return (
    <header className="grid gap-12 p-w pt-32 lg:pt-48">
      <div className="grid gap-4">
        <Reveal as="h1" effect="split" className="style-heading text-xl lg:text-3xl">
          {title}
        </Reveal>
        <Reveal as="p" effect="fade" delay={0.5} className="text-base leading-normal lg:max-w-[60ch]">
          {intro}
        </Reveal>
      </div>
      <Reveal effect="fade" delay={0.75} className="grid items-center gap-4 lg:flex lg:gap-8">
        <div className="style-caption flex items-center gap-4">
          <span>{site.ui.quickNav}</span>
          <span className="max-lg:hidden">→</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {quickNav.map((l) => (
            <TransitionLink
              key={l.href}
              href={l.href}
              className="style-caption-xs rounded-2xl border bg-white px-2 py-1 !font-normal transition-all duration-300 lg:hover:px-3"
            >
              {l.label}
            </TransitionLink>
          ))}
        </div>
      </Reveal>
    </header>
  );
}

/** Rooms list with separators, hover state, gallery modal and a direct "Reservar" button */
export function ItemList({ id, srTitle, items, headingLevel = "h3" }: { id: string; srTitle: string; items: Room[]; headingLevel?: "h2" | "h3" }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const close = useCallback(() => setOpenId(null), []);

  return (
    <section id={id} className="bg-white p-w max-lg:pt-12">
      <h2 className="sr-only">{srTitle}</h2>
      {items.map((item, i) => (
        <div key={item.id} className="mb-12 grid gap-6 lg:mb-w">
          {i > 0 && <Reveal effect="separator" className="h-[0.5px] w-full bg-black" />}
          <Reveal
            as="article"
            effect="delayedFade"
            className="group cursor-pointer rounded-lg transition-colors duration-500 lg:p-4 lg:hover:bg-neutral-100"
            onClick={() => setOpenId(item.id)}
          >
            <div className="flex items-start gap-w max-lg:flex-col">
              <Reveal as={headingLevel} effect="delayedSplit" className="style-heading text-xl lg:hidden lg:text-2xl">
                {item.name}
              </Reveal>
              <div className="relative aspect-square w-full overflow-clip rounded-lg bg-neutral-300 lg:w-72">
                <Image
                  src={item.image.src}
                  alt={item.image.alt}
                  fill
                  sizes="(min-width: 1024px) 288px, 100vw"
                  priority={i === 0}
                  className="object-cover transition-transform duration-500 lg:group-hover:scale-110"
                />
                <button
                  type="button"
                  aria-label={`${site.ui.openGallery}: ${item.name}`}
                  className="flex-center absolute right-2 bottom-2 size-8 rounded-2xl border bg-white lg:hidden"
                >
                  <span aria-hidden="true" className="text-lg leading-none">+</span>
                </button>
              </div>
              <div className="flex flex-1 flex-col gap-4">
                <div className="grid gap-1">
                  <Reveal as={headingLevel} effect="delayedSplit" className="style-heading text-xl max-lg:hidden lg:text-2xl">
                    {item.name}
                  </Reveal>
                  <p className="style-caption-xs !font-light">{item.meta}</p>
                </div>
                <ul>
                  {item.specs.map((s) => (
                    <li key={s.text} className="flex items-center gap-3">
                      <Icon name={s.icon} className="size-4 shrink-0" />
                      <span>{s.text}</span>
                    </li>
                  ))}
                </ul>
                <p className="max-w-[60ch] text-base">{item.text}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-4 max-lg:w-full max-lg:flex-row max-lg:items-center max-lg:justify-between">
                <button
                  type="button"
                  className="style-caption-xs rounded-2xl border bg-white px-2 py-1 !font-normal transition-colors duration-500 group-hover:bg-black group-hover:text-white max-lg:hidden"
                >
                  {site.ui.openGallery}
                </button>
                <p className="style-heading text-xl lg:mt-auto lg:text-2xl">
                  {priceLabel(item)}
                  {hasPrice(item) && <span className="font-body text-sm tracking-normal">{site.ui.perNight}</span>}
                </p>
                <TransitionLink
                  href={`/reservar?habitacion=${item.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="style-button"
                >
                  {site.ui.book}
                  <Arrow />
                </TransitionLink>
              </div>
            </div>
          </Reveal>
        </div>
      ))}
      {items.map((item) => (
        <GalleryModal
          key={item.id}
          open={openId === item.id}
          onClose={close}
          title={item.name}
          meta={item.meta}
          images={[item.image, ...item.gallery]}
        />
      ))}
    </section>
  );
}

/** Centered white card (Tarifa única on Espacios) */
export function CenteredCard({ id, title, text }: { id?: string; title: string; text: string }) {
  return (
    <section id={id} className="mx-auto pt-0 max-lg:p-w lg:max-w-4xl">
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg bg-white p-w">
        <Reveal as="h2" effect="delayedSplit" className="style-heading text-xl lg:text-3xl">
          {title}
        </Reveal>
        <Reveal as="p" effect="delayedFade" className="text-center text-base leading-normal lg:max-w-[60ch]">
          {text}
        </Reveal>
      </div>
    </section>
  );
}

/** Image + text card ("Adaptado a lo que necesitáis", "Propuesta a medida") */
export function MediaTextCard({
  title,
  children,
  image,
  imageClassName = "aspect-[4/5] w-full lg:w-60",
  outerClassName = "my-w mx-auto max-w-4xl",
}: {
  title: string;
  children: ReactNode;
  image: Media;
  imageClassName?: string;
  outerClassName?: string;
}) {
  return (
    <section className={`grid items-center gap-8 rounded-lg bg-white p-w lg:flex ${outerClassName}`}>
      <Reveal effect="delayedFade" className={`shrink-0 max-lg:max-w-sm ${imageClassName}`}>
        <Frame image={image} sizes="(min-width: 1024px) 320px, 100vw" className="size-full" />
      </Reveal>
      <div className="grid max-w-xl gap-4">
        <Reveal as="h2" effect="delayedSplit" className="style-heading text-xl text-balance lg:text-2xl">
          {title}
        </Reveal>
        <Reveal effect="delayedFade" className="grid gap-4 text-base leading-normal">
          {children}
        </Reveal>
      </div>
    </section>
  );
}

/** 2/3 column icon tiles (Equipamiento) */
export function IconGrid({ id, title, items, note }: { id: string; title: string; items: IconCard[]; note?: string }) {
  return (
    <section id={id} className="mx-auto my-14 grid gap-6 max-lg:p-w lg:max-w-4xl">
      <Reveal as="h2" effect="delayedSplit" className="style-heading text-xl lg:text-3xl">
        {title}
      </Reveal>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {items.map((it) => (
          <Reveal key={it.title} effect="delayedFade" className="flex flex-col items-center justify-center gap-2 rounded-lg bg-white p-4 lg:p-6">
            <Icon name={it.icon} className="size-6 lg:mb-2 lg:size-8" strokeWidth={1} />
            <h3 className="style-heading text-center text-sm lg:text-base">{it.title}</h3>
            <p className="text-center text-xs max-lg:hidden">{it.text}</p>
          </Reveal>
        ))}
      </div>
      {note && (
        <Reveal as="p" effect="delayedFade" className="max-w-[60ch] text-sm">
          {note}
        </Reveal>
      )}
    </section>
  );
}

/** Image cards in a centered wrapping row (Servicios) */
export function AmenityCards({ id, title, text, items }: { id: string; title: string; text: string; items: ImageCard[] }) {
  return (
    <section id={id} className="mx-auto my-14 grid gap-6 max-lg:p-w lg:max-w-4xl">
      <div className="mx-auto grid w-full gap-3">
        <Reveal as="h2" effect="delayedSplit" className="style-heading text-xl lg:text-3xl">
          {title}
        </Reveal>
        <Reveal as="p" effect="delayedFade" className="text-base leading-normal lg:max-w-[60ch]">
          {text}
        </Reveal>
      </div>
      <div className="grid flex-wrap justify-center gap-4 lg:flex">
        {items.map((it) => (
          <Reveal key={it.title} effect="delayedFade" className="flex gap-4 rounded-lg bg-white p-4 lg:w-[calc(33%-0.5rem)] lg:flex-col">
            <Frame
              image={it.image}
              sizes="(min-width: 1024px) 260px, 192px"
              className="aspect-[5/6] h-fit shrink-0 max-lg:w-48 lg:aspect-[6/4]"
            />
            <div className="grid h-fit w-full items-start gap-2">
              <h3 className="style-heading flex items-center gap-2 text-base lg:text-lg">
                <Icon name={it.icon} className="size-4 shrink-0" />
                {it.title}
              </h3>
              <p className="text-sm">{it.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
