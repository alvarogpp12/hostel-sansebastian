import { StickyBookBar } from "@/components/booking/StickyBookBar";
import { BookingBand, InfoRows, PAGE_HERO_ID, PageHero } from "@/components/sections/Page";
import { getDict } from "@/content/i18n";
import type { Locale } from "@/i18n/config";

export function PracticalView({ locale }: { locale: Locale }) {
  const { eyebrow, title, intro, image, cards } = getDict(locale).practical;
  return (
    <>
      <main id="content" className="pb-16">
        <PageHero eyebrow={eyebrow} title={title} intro={intro} image={image} locale={locale} />
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
        <BookingBand locale={locale} />
      </main>
      <StickyBookBar watch={PAGE_HERO_ID} />
    </>
  );
}
