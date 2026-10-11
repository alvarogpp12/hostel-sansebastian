import type { Metadata } from "next";
import { StickyBookBar } from "@/components/booking/StickyBookBar";
import { ArrowOut } from "@/components/icons";
import { BookingBand, ImageCards, PAGE_HERO_ID, PageHero, Section } from "@/components/sections/Page";
import { locationPage } from "@/content/pages";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Ubicación y qué ver en San Sebastián",
  description:
    "Un alojamiento céntrico junto a la playa de Gros y a un paseo de la Parte Vieja. Qué ver cerca: La Concha, el Peine del Viento, el monte Urgull y rutas de pintxos.",
  alternates: { canonical: "/ubicacion" },
};

export default function LocationPage() {
  const { eyebrow, title, intro, image, quickNav, places, mapTitle, mapText, mapLink } = locationPage;
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(site.contact.mapQuery)}&z=13&output=embed`;
  return (
    <>
      <main id="content" className="pb-16">
        <PageHero eyebrow={eyebrow} title={title} intro={intro} image={image} links={quickNav} />

        <Section id="que-ver" title={places.title} text={places.text}>
          <ImageCards items={places.items} />
        </Section>

        <Section id="como-llegar" title={mapTitle}>
          <div className="grid overflow-clip rounded-lg bg-white lg:grid-cols-12">
            <div className="grid content-center gap-4 p-6 lg:col-span-4 lg:p-10">
              <p className="text-neutral-700 lg:text-lg">{mapText}</p>
              <p className="text-sm text-neutral-500">{site.legal.addressLine}</p>
              <a
                href={site.contact.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="style-button min-h-12"
              >
                {mapLink}
                <ArrowOut />
              </a>
            </div>
            <div className="relative aspect-[4/3] bg-neutral-200 lg:col-span-8 lg:aspect-auto lg:min-h-[480px]">
              <iframe
                title={`Mapa de ${site.contact.mapQuery}`}
                src={mapSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 size-full border-0 grayscale-[0.9] sepia-[0.15]"
              />
            </div>
          </div>
        </Section>

        <BookingBand />
      </main>
      <StickyBookBar watch={PAGE_HERO_ID} />
    </>
  );
}
