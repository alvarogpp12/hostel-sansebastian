import type { LegalDoc } from "@/content/legal";
import { PageIntro } from "./Page";

export function LegalPage({ title, updated, sections }: LegalDoc) {
  return (
    <main id="content" className="pb-16">
      <PageIntro eyebrow="Información legal" title={title} />
      <div className="px-w">
        <div className="rounded-lg bg-white p-6 lg:p-12">
          <div className="grid max-w-[68ch] gap-10 text-neutral-700 lg:text-lg">
            {sections.map((s, i) => (
              <section key={s.title ?? i} className="grid gap-4">
                {s.title && <h2 className="style-heading text-xl text-black lg:text-2xl">{s.title}</h2>}
                {s.body.map((b, j) =>
                  b.type === "p" ? (
                    <p key={j}>{b.text}</p>
                  ) : (
                    <ul key={j} className="grid list-disc gap-2 pl-5">
                      {b.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ),
                )}
              </section>
            ))}
            <p className="text-sm text-neutral-500">Última actualización: {updated}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
