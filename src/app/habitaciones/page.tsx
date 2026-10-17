import type { Metadata } from "next";
import { StickyBookBar } from "@/components/booking/StickyBookBar";
import { BookingBand, MediaRow, PAGE_HERO_ID, PageHero, Section, StripList } from "@/components/sections/Page";
import { RoomRows } from "@/components/sections/RoomRows";
import { roomsPage } from "@/content/pages";
import { getRoomPhotos } from "@/lib/redforts/room-photos";

/** Las fotos de las habitaciones vienen de Redforts: se refrescan cada 10 min */
export const revalidate = 600;

export const metadata: Metadata = {
  title: "Habitaciones en el centro de San Sebastián",
  description:
    "Habitaciones dobles, de dos camas y familiares en el centro de San Sebastián, con baño compartido o privado. Reserva directa sin comisiones.",
  alternates: { canonical: "/habitaciones" },
};

export default async function RoomsPage() {
  const photos = await getRoomPhotos();
  const { eyebrow, title, intro, image, quickNav, bathrooms, included } = roomsPage;
  return (
    <>
      <main id="content" className="pb-16">
        <PageHero eyebrow={eyebrow} title={title} intro={intro} image={image} links={quickNav} />
        <section id="habitaciones" aria-label="Habitaciones" className="scroll-mt-24 px-w pt-12 lg:pt-20">
          <RoomRows detailed photos={photos} />
        </section>
        <Section id="banos" title={bathrooms.title}>
          <MediaRow image={bathrooms.image} title={bathrooms.subtitle}>
            <p>{bathrooms.text}</p>
          </MediaRow>
        </Section>
        <Section id="que-incluye" title={included.title} text={included.text}>
          <StripList items={included.items} columns={4} />
        </Section>
        <BookingBand />
      </main>
      <StickyBookBar watch={PAGE_HERO_ID} />
    </>
  );
}
