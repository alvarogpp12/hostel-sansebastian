import type { Metadata } from "next";
import { StickyBookBar } from "@/components/booking/StickyBookBar";
import { FaqSchema } from "@/components/Schema";
import { BookingHero, HomeCity, HomeFaq, HomeFeatures, HomeRooms } from "@/components/sections/HomeSections";
import { site } from "@/content/site";

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
      </main>
      <StickyBookBar watch="reserva-rapida" />
      <FaqSchema />
    </>
  );
}
