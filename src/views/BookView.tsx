import { Suspense } from "react";
import { RedfortsBooking } from "@/components/booking/RedfortsBooking";
import { BookingForm } from "@/components/sections/BookingForm";
import { PageIntro } from "@/components/sections/Page";
import { bookingProvider, checkoutMode } from "@/content/booking";
import { getDict } from "@/content/i18n";
import { site } from "@/content/site";
import type { Locale } from "@/i18n/config";
import { isRedfortsConfigured } from "@/lib/redforts/client";
import { getInventory, toPublicInventory, type PublicInventory } from "@/lib/redforts/inventory";

/** Inventario público para el flujo nativo, en el idioma de la página si Redforts lo tiene; null si no responde */
async function loadInventory(locale: Locale): Promise<PublicInventory | null> {
  if (!isRedfortsConfigured()) return null;
  try {
    return toPublicInventory(await getInventory(), locale);
  } catch (error) {
    console.error("[reservar] no se pudo cargar el inventario de Redforts", error);
    return null;
  }
}

export async function BookView({ locale }: { locale: Locale }) {
  const t = getDict(locale).book;
  const provider = bookingProvider();
  const inventory = provider === "redforts" ? await loadInventory(locale) : null;

  return (
    <main id="content" className="pb-16">
      <PageIntro eyebrow={t.eyebrow} title={t.title} intro={<p className="max-sm:sr-only">{t.intro}</p>} />
      <div className="mx-w rounded-lg bg-white p-5 lg:p-12">
        {/* Sin animación de entrada: el formulario tiene que poder usarse al instante */}
        <div>
          {provider === "legacy" ? (
            <Suspense fallback={null}>
              <BookingForm />
            </Suspense>
          ) : inventory ? (
            // Lee las fechas de la URL (useSearchParams): necesita su Suspense
            <Suspense fallback={null}>
              <RedfortsBooking inventory={inventory} mode={checkoutMode()} />
            </Suspense>
          ) : (
            <div className="grid gap-3 border border-neutral-300 p-4 text-sm">
              <p>{t.notConfigured}</p>
              <div className="flex flex-col">
                <a className="w-fit underline" href={`mailto:${site.contact.email}`}>
                  {site.contact.email}
                </a>
                {site.contact.phones.map((ph) => (
                  <a key={ph.href} className="w-fit underline" href={ph.href}>
                    {ph.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
