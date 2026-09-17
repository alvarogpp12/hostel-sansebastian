import { Logo } from "@/components/brand/Logo";
import { ArrowOut } from "@/components/icons";
import { Reveal } from "@/components/Reveal";
import { TransitionLink } from "@/components/TransitionLink";
import { site } from "@/content/site";

export function Cta() {
  const { title, text, button } = site.cta;
  return (
    <section className="mb-24 flex flex-col items-center gap-8 p-w">
      <Logo variant="icon" tone="dark" className="mx-auto size-14" />
      <div className="grid gap-4">
        <Reveal as="h2" effect="delayedSplit" className="style-heading text-center text-xl lg:text-3xl">
          {title}
        </Reveal>
        <Reveal as="p" effect="delayedFade" className="text-center text-base leading-normal lg:max-w-[60ch]">
          {text}
        </Reveal>
      </div>
      <Reveal effect="fade" duration={0.25}>
        <TransitionLink href={button.href} className="style-button">
          <Reveal as="span" effect="delayedSplit" delay={0.5}>
            {button.label}
          </Reveal>
          <ArrowOut />
        </TransitionLink>
      </Reveal>
    </section>
  );
}
