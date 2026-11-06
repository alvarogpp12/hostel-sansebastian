import { StickyBookBar } from "@/components/booking/StickyBookBar";
import { FaqSchema } from "@/components/Schema";
import { BookingHero, HomeCity, HomeFaq, HomeFeatures, HomeRooms } from "@/components/sections/HomeSections";
import { BookingBand } from "@/components/sections/Page";
import type { Locale } from "@/i18n/config";

/**
 * Home pensada como embudo de reserva: buscador en el hero, habitaciones con
 * su botón de reservar y una barra fija que aparece al bajar.
 */
export function HomeView({ locale }: { locale: Locale }) {
  return (
    <>
      <main id="content" className="pb-16">
        <BookingHero locale={locale} />
        <HomeRooms locale={locale} />
        <HomeFeatures locale={locale} />
        <HomeCity locale={locale} />
        <HomeFaq locale={locale} />
        <BookingBand locale={locale} />
      </main>
      <StickyBookBar watch="reserva-rapida" />
      <FaqSchema locale={locale} />
    </>
  );
}
