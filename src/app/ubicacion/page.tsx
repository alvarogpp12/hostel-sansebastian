import type { Metadata } from "next";
import { ArrowOut } from "@/components/icons";
import { Reveal } from "@/components/Reveal";
import { Cta } from "@/components/sections/Cta";
import { AmenityCards } from "@/components/sections/PageSections";
import { locationPage } from "@/content/pages";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Ubicación y qué ver en San Sebastián",
  description:
    "Dónde estamos y qué ver en San Sebastián gastando poco: La Concha, el Peine del Viento, el monte Urgull y rutas de pintxos cerca de nuestro hostal barato.",
  alternates: { canonical: "/ubicacion" },
};

export default function LocationPage() {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(site.contact.mapQuery)}&z=13&output=embed`;
  return (
    <>
      <main id="content">
        <header className="grid gap-4 p-w pt-32 lg:pt-48">
          <Reveal as="h1" effect="split" className="style-heading text-xl lg:text-3xl">
            {locationPage.title}
          </Reveal>
          <Reveal as="p" effect="fade" delay={0.5} className="text-base leading-normal lg:max-w-[60ch]">
            {locationPage.intro}
          </Reveal>
        </header>

        <AmenityCards
          id="que-ver"
          title={locationPage.places.title}
          text={locationPage.places.text}
          items={locationPage.places.items}
        />

        <section className="mx-auto my-14 grid max-w-4xl gap-6 px-w">
          <Reveal as="h2" effect="delayedSplit" className="style-heading text-xl lg:text-3xl">
            {locationPage.mapTitle}
          </Reveal>
          <Reveal as="p" effect="delayedFade" className="text-base leading-normal lg:max-w-[60ch]">
            {locationPage.mapText}
          </Reveal>
          <Reveal effect="delayedFade" className="relative aspect-[6/4] w-full overflow-clip rounded-lg bg-neutral-200">
            <iframe
              title={`Mapa de ${site.contact.mapQuery}`}
              src={mapSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 size-full border-0 grayscale-[0.9] sepia-[0.15]"
            />
          </Reveal>
          <Reveal effect="delayedFade">
            <a
              href={site.contact.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-fit items-center gap-2 transition-all lg:hover:gap-3"
            >
              <span className="style-caption !text-xs underline">Ver en Google Maps</span>
              <ArrowOut />
            </a>
          </Reveal>
        </section>
      </main>
      <Cta />
    </>
  );
}
