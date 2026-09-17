import { Reveal } from "@/components/Reveal";

export function LegalPage({ title, body }: { title: string; body: string }) {
  return (
    <main id="content" className="mx-auto grid max-w-3xl gap-6 p-w pt-32 pb-24 lg:pt-48">
      <Reveal as="h1" effect="split" className="style-heading text-2xl lg:text-3xl">
        {title}
      </Reveal>
      <Reveal effect="separator" className="h-[0.5px] w-full bg-black" />
      <Reveal as="p" effect="fade" delay={0.5}>
        {body}
      </Reveal>
    </main>
  );
}
