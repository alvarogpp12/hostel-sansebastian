import { StickyBookBar } from "@/components/booking/StickyBookBar";
import { ConsentMap } from "@/components/ConsentMap";
import { ArrowOut } from "@/components/icons";
import { BookingBand, ImageCards, PAGE_HERO_ID, PageHero, Section } from "@/components/sections/Page";
import { getDict } from "@/content/i18n";
import { site } from "@/content/site";
import type { Locale } from "@/i18n/config";

export function LocationView({ locale }: { locale: Locale }) {
  const d = getDict(locale);
  const { eyebrow, title, intro, image, quickNav, places, mapTitle, mapText, mapLink } = d.locationPage;
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(site.contact.mapQuery)}&z=13&output=embed&hl=${locale}`;
  return (
    <>
      <main id="content" className="pb-16">
        <PageHero eyebrow={eyebrow} title={title} intro={intro} image={image} links={quickNav} locale={locale} />

        <Section id="que-ver" title={places.title} text={places.text}>
          <ImageCards items={places.items} />
        </Section>

        <Section id="como-llegar" title={mapTitle}>
          <div className="grid overflow-clip rounded-lg bg-white lg:grid-cols-12">
            <div className="grid content-center gap-4 p-6 lg:col-span-4 lg:p-10">
              <p className="text-neutral-700 lg:text-lg">{mapText}</p>
              <p className="text-sm text-neutral-500">{site.legal.addressLine}</p>
              <a href={site.contact.mapsUrl} target="_blank" rel="noopener noreferrer" className="style-button min-h-12">
                {mapLink}
                <ArrowOut />
              </a>
            </div>
            <div className="relative aspect-[4/3] bg-neutral-200 lg:col-span-8 lg:aspect-auto lg:min-h-[480px]">
              <ConsentMap title={`${d.site.ui.mapOf} ${site.contact.mapQuery}`} src={mapSrc} />
            </div>
          </div>
        </Section>

        <BookingBand locale={locale} />
      </main>
      <StickyBookBar watch={PAGE_HERO_ID} />
    </>
  );
}
