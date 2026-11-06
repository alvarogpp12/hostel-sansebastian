import { StickyBookBar } from "@/components/booking/StickyBookBar";
import { BookingBand, MediaRow, PAGE_HERO_ID, PageHero, Section, StripList } from "@/components/sections/Page";
import { RoomRows } from "@/components/sections/RoomRows";
import { getDict } from "@/content/i18n";
import type { Locale } from "@/i18n/config";

export function RoomsView({ locale }: { locale: Locale }) {
  const d = getDict(locale);
  const { eyebrow, title, intro, image, quickNav, bathrooms, included } = d.roomsPage;
  return (
    <>
      <main id="content" className="pb-16">
        <PageHero eyebrow={eyebrow} title={title} intro={intro} image={image} links={quickNav} locale={locale} />
        <section id="habitaciones" aria-label={d.site.ui.roomsAria} className="scroll-mt-24 px-w pt-12 lg:pt-20">
          <RoomRows detailed />
        </section>
        <Section id="banos" title={bathrooms.title}>
          <MediaRow image={bathrooms.image} title={bathrooms.subtitle}>
            <p>{bathrooms.text}</p>
          </MediaRow>
        </Section>
        <Section id="que-incluye" title={included.title} text={included.text}>
          <StripList items={included.items} columns={4} />
        </Section>
        <BookingBand locale={locale} />
      </main>
      <StickyBookBar watch={PAGE_HERO_ID} />
    </>
  );
}
