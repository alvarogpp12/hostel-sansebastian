"use client";

import { useCallback, useState } from "react";
import { Arrow, Icon } from "@/components/icons";
import { TransitionLink } from "@/components/TransitionLink";
import { Frame } from "@/components/ui";
import { hasPrice, priceLabel, rooms } from "@/content/rooms";
import { site } from "@/content/site";
import { bookingHref } from "@/lib/booking-search";
import type { RoomPhotos } from "@/lib/redforts/room-photos";
import { GalleryModal } from "./GalleryModal";

/**
 * Habitaciones en filas comparables: foto, qué incluye y, a la derecha, precio
 * y «Reservar esta» con la habitación ya elegida.
 *  - Home: texto corto y enlace a la ficha en /habitaciones.
 *  - /habitaciones (`detailed`): texto largo y galería de fotos.
 * `photos`: las de Redforts (ver getRoomPhotos); si una habitación no tiene,
 * se usan las de content/rooms.ts.
 */
export function RoomRows({ detailed = false, photos: remote = {} }: { detailed?: boolean; photos?: RoomPhotos }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const close = useCallback(() => setOpenId(null), []);
  const Heading = detailed ? "h2" : "h3";

  return (
    <>
      <ul className="grid gap-3">
        {rooms.map((room, i) => {
          const photos = remote[room.id] ?? [room.image, ...room.gallery];
          return (
            <li key={room.id} id={detailed ? room.id : undefined} className="scroll-mt-24">
              <article className="group grid overflow-clip rounded-lg bg-white md:grid-cols-[minmax(0,18rem)_1fr] lg:grid-cols-[22rem_1fr_17rem]">
                <div className="relative md:row-span-2 lg:row-span-1">
                  <Frame
                    image={photos[0]}
                    priority={detailed && i === 0}
                    sizes="(min-width: 1024px) 22rem, (min-width: 768px) 18rem, 100vw"
                    className="aspect-[16/10] size-full !rounded-none md:aspect-auto md:min-h-60"
                    imgClassName="transition-transform duration-700 lg:group-hover:scale-105"
                  />
                  {detailed && (
                    // Toda la foto abre el visor; el botón lo deja claro
                    <button
                      type="button"
                      onClick={() => setOpenId(room.id)}
                      aria-label={`${site.ui.openGallery}: ${room.name}`}
                      className="absolute inset-0 cursor-zoom-in"
                    />
                  )}
                  {detailed && (
                    <button
                      type="button"
                      onClick={() => setOpenId(room.id)}
                      tabIndex={-1}
                      aria-hidden="true"
                      className="absolute right-3 bottom-3 flex min-h-10 items-center gap-2 rounded-full bg-white/95 px-4 text-xs font-medium shadow-sm transition-colors hover:bg-white"
                    >
                      {site.ui.openGallery} ({photos.length})
                    </button>
                  )}
                </div>
                <div className="grid content-center gap-3 p-5 lg:p-8">
                  <p className="style-caption-xs !font-light">{room.meta}</p>
                  <Heading className="style-heading text-xl lg:text-2xl">{room.name}</Heading>
                  <p className="max-w-[64ch] text-sm text-neutral-700 lg:text-base">{detailed ? room.text : room.cardText}</p>
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
                    <TransitionLink href={bookingHref({ room: room.id })} className="style-button min-h-12 justify-center lg:!w-full">
                      Reservar esta
                      <Arrow />
                    </TransitionLink>
                    {!detailed && (
                      <TransitionLink href={`/habitaciones#${room.id}`} className="text-center text-xs underline max-lg:hidden">
                        Ver fotos y detalles
                      </TransitionLink>
                    )}
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
      {detailed &&
        rooms.map((room) => (
          <GalleryModal
            key={room.id}
            open={openId === room.id}
            onClose={close}
            title={room.name}
            meta={room.meta}
            images={remote[room.id] ?? [room.image, ...room.gallery]}
          />
        ))}
    </>
  );
}
