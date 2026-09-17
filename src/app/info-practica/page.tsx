import type { Metadata } from "next";
import { ArrowOut, Icon } from "@/components/icons";
import { Reveal } from "@/components/Reveal";
import { TransitionLink } from "@/components/TransitionLink";
import { Cta } from "@/components/sections/Cta";
import { ButtonLink } from "@/components/ui";
import { practical } from "@/content/pages";
import { site } from "@/content/site";

export const metadata: Metadata = { title: practical.title };

export default function PracticalPage() {
  return (
    <>
    <main id="content">
      <section className="mx-auto grid max-w-5xl gap-12 p-w pt-32 lg:pt-48">
        <div className="grid gap-w lg:gap-12">
          <div className="grid gap-6">
            <div className="flex gap-2 max-lg:flex-col lg:items-center lg:justify-between">
              <Reveal as="h1" effect="split" className="style-heading text-2xl lg:text-3xl">
                {practical.title}
              </Reveal>
              <Reveal effect="fade" duration={0.25}>
                <ButtonLink href={site.cta.button.href}>{site.cta.button.label}</ButtonLink>
              </Reveal>
            </div>
            <Reveal effect="separator" className="h-[0.5px] w-full bg-black" />
          </div>
          <div className="grid gap-w lg:grid-cols-2">
            {practical.cards.map((card) => (
              <Reveal
                key={card.title}
                effect="delayedFade"
                className={`flex flex-col gap-6 rounded-lg border border-neutral-300 bg-white p-6 ${card.wide ? "lg:col-span-2" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <Icon name={card.icon} className="size-4 shrink-0" />
                  <Reveal as="h2" effect="delayedSplit" className="style-heading text-base">
                    {card.title}
                  </Reveal>
                </div>
                <div className="grid gap-2">
                  {card.body.map((b, i) => {
                    if (b.type === "ul")
                      return (
                        <ul key={i} className="list-disc pl-4">
                          {b.items.map((it) => (
                            <li key={it}>{it}</li>
                          ))}
                        </ul>
                      );
                    if (b.type === "em")
                      return (
                        <p key={i} className="text-sm text-neutral-500">
                          {b.text}
                        </p>
                      );
                    return <p key={i}>{b.text}</p>;
                  })}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="my-16 flex flex-col items-center gap-8 p-w">
        <div className="grid gap-4">
          <Reveal as="h2" effect="delayedSplit" className="style-heading text-center text-xl lg:text-3xl">
            {practical.services.title}
          </Reveal>
          <Reveal as="p" effect="delayedFade" className="text-center text-base leading-normal lg:max-w-[60ch]">
            {practical.services.text}
          </Reveal>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-4 lg:gap-8">
          {practical.services.links.map((l) => (
            <Reveal key={l.href} effect="delayedFade">
              <TransitionLink href={l.href} className="flex items-center gap-2">
                <span className="style-caption !text-xs !font-light underline">{l.label}</span>
                <ArrowOut />
              </TransitionLink>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
    <Cta />
    </>
  );
}
