import { PageIntro } from "./Page";

export function LegalPage({ title, body }: { title: string; body: string }) {
  return (
    <main id="content" className="pb-16">
      <PageIntro eyebrow="Información legal" title={title} />
      <div className="px-w">
        <div className="rounded-lg bg-white p-6 lg:p-12">
          <div className="grid max-w-[68ch] gap-4 text-neutral-700 lg:text-lg">
            <p>{body}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
