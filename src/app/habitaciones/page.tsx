import type { Metadata } from "next";
import { Icon } from "@/components/icons";
import { Reveal } from "@/components/Reveal";
import { Cta } from "@/components/sections/Cta";
import { ItemList, MediaTextCard, PageHeader } from "@/components/sections/PageSections";
import { Fade } from "@/components/ui";
import { roomsPage } from "@/content/pages";
import { rooms } from "@/content/rooms";

export const metadata: Metadata = {
  title: "Habitaciones baratas en San Sebastián",
  description:
    "Habitaciones individuales, dobles y triples en un hostal barato de San Sebastián. Habitación privada, baño compartido y reserva directa sin comisiones.",
  alternates: { canonical: "/habitaciones" },
};

export default function RoomsPage() {
  return (
    <>
      <main id="content">
        <PageHeader title={roomsPage.title} intro={roomsPage.intro} quickNav={roomsPage.quickNav} />
        <ItemList id="habitaciones" srTitle="Habitaciones" items={rooms} headingLevel="h2" />
        <Fade />
        <div id="banos" className="px-w">
          <MediaTextCard title={roomsPage.bathrooms.title} image={roomsPage.bathrooms.image} imageClassName="aspect-[4/5] w-full lg:w-56">
            <p>{roomsPage.bathrooms.text}</p>
          </MediaTextCard>
        </div>
        <section id="que-incluye" className="p-w pt-0">
          <div className="mx-auto grid max-w-4xl gap-8 rounded-lg bg-white p-w">
            <Reveal as="h2" effect="delayedSplit" className="style-heading text-xl lg:text-3xl">
              {roomsPage.included.title}
            </Reveal>
            <Reveal as="p" effect="delayedFade" className="text-base leading-normal lg:max-w-[60ch]">
              {roomsPage.included.text}
            </Reveal>
            <div className="grid gap-4 lg:grid-cols-2">
              {roomsPage.included.items.map((it) => (
                <Reveal key={it.title} effect="delayedFade" className="grid h-fit gap-2 rounded-lg bg-neutral-100 p-4">
                  <div className="flex items-center gap-2">
                    <Icon name={it.icon} className="size-4 shrink-0" />
                    <h3 className="style-heading text-base">{it.title}</h3>
                  </div>
                  <p className="pl-6 text-sm">{it.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Cta />
    </>
  );
}
