import type { Metadata } from "next";
import { StickyBookBar } from "@/components/booking/StickyBookBar";
import { FaqSchema } from "@/components/Schema";
import { BookingHero, HomeCity, HomeFaq, HomeFeatures, HomeRooms } from "@/components/sections/HomeSections";
import { BookingBand } from "@/components/sections/Page";
import { site } from "@/content/site";

/** Las fotos de las habitaciones vienen de Redforts: se refrescan cada 10 min */
export const revalidate = 600;

export const metadata: Metadata = {
  title: site.seo.title,
  description: site.seo.description,
  alternates: { canonical: "/" },
};

/**
 * Home pensada como embudo de reserva: buscador en el hero, habitaciones con
 * su botón de reservar y una barra fija que aparece al bajar.
 */
export default function HomePage() {
  return (
    <>
      <main id="content" className="pb-16">
        <BookingHero />
        <HomeRooms />
        <HomeFeatures />
        <HomeCity />
        <HomeFaq />
        <BookingBand />
      </main>
      <StickyBookBar watch="reserva-rapida" />
      <FaqSchema />
    </>
  );
}
