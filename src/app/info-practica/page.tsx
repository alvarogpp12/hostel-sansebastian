import type { Metadata } from "next";
import { StickyBookBar } from "@/components/booking/StickyBookBar";
import { BookingBand, InfoRows, PAGE_HERO_ID, PageHero } from "@/components/sections/Page";
import { practical } from "@/content/pages";

export const metadata: Metadata = { title: practical.title, alternates: { canonical: "/info-practica" } };

export default function PracticalPage() {
  const { eyebrow, title, intro, image, cards } = practical;
  return (
    <>
      <main id="content" className="pb-16">
        <PageHero eyebrow={eyebrow} title={title} intro={intro} image={image} />
        <div className="px-w pt-12 lg:pt-20">
          <InfoRows
            rows={cards.map((card) => ({
              icon: card.icon,
              title: card.title,
              body: card.body.map((b, i) => {
                if (b.type === "ul")
                  return (
                    <ul key={i} className="grid list-disc gap-1 pl-5">
                      {b.items.map((it) => (
                        <li key={it}>{it}</li>
                      ))}
                    </ul>
                  );
                if (b.type === "em")
                  return (
                    <p key={i} className="text-sm text-neutral-500 lg:text-base">
                      {b.text}
                    </p>
                  );
                return <p key={i}>{b.text}</p>;
              }),
            }))}
          />
        </div>
        <BookingBand />
      </main>
      <StickyBookBar watch={PAGE_HERO_ID} />
    </>
  );
}
