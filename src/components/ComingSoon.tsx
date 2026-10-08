import { Logo } from "@/components/brand/Logo";
import { comingSoon } from "@/content/home";

/**
 * Pantalla de "Próximamente" que se ve en producción mientras la web no está
 * abierta (ver `site.comingSoon`). Sale el logo animado y, al terminar la
 * animación, aparece el texto. Todo en CSS: no necesita JavaScript.
 */
export function ComingSoon() {
  return (
    <main
      id="content"
      className="flex min-h-svh flex-col items-center justify-center gap-10 bg-beige px-w py-16 text-center"
    >
      <h1 className="sr-only">{comingSoon.srTitle}</h1>
      <Logo variant="full" tone="dark" animated priority className="h-auto w-[min(72vw,340px)]" />
      <div data-coming-soon-text className="grid max-w-[46ch] gap-4">
        <p className="style-caption">{comingSoon.eyebrow}</p>
        <p className="style-heading text-2xl !leading-tight lg:text-3xl">{comingSoon.title}</p>
        <p className="text-base leading-relaxed">{comingSoon.text}</p>
      </div>
    </main>
  );
}
