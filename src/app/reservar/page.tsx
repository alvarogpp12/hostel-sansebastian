import type { Metadata } from "next";
import { Suspense } from "react";
import { RedfortsBooking } from "@/components/booking/RedfortsBooking";
import { BookingForm } from "@/components/sections/BookingForm";
import { PageIntro } from "@/components/sections/Page";
import { bookingProvider, checkoutMode } from "@/content/booking";
import { bookingPage } from "@/content/pages";
import { site } from "@/content/site";
import { isRedfortsConfigured } from "@/lib/redforts/client";
import { getInventory, toPublicInventory, type PublicInventory } from "@/lib/redforts/inventory";

export const metadata: Metadata = {
  title: "Reservar habitación en San Sebastián",
  description:
    "Reserva online en nuestro alojamiento céntrico de San Sebastián: elige habitación y fechas, consulta la disponibilidad y el precio reales y solicita tu reserva. Reserva directa sin comisiones.",
  alternates: { canonical: "/reservar" },
};

/**
 * Se regenera cada 10 min: si Redforts no respondía al construir la página
 * (aviso de contacto), no se queda así hasta el siguiente despliegue.
 */
export const revalidate = 600;

/** Inventario público para el flujo nativo; null si Redforts no responde */
async function loadInventory(): Promise<PublicInventory | null> {
  if (!isRedfortsConfigured()) return null;
  try {
    return toPublicInventory(await getInventory(), "es");
  } catch (error) {
    console.error("[reservar] no se pudo cargar el inventario de Redforts", error);
    return null;
  }
}

export default async function BookingPage() {
  const provider = bookingProvider();
  const inventory = provider === "redforts" ? await loadInventory() : null;

  return (
    <main id="content" className="pb-16">
      <PageIntro
        eyebrow="Reserva directa"
        title={bookingPage.formTitle}
        intro={<p className="max-sm:sr-only">{bookingPage.formIntro}</p>}
      />
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
              <p>{bookingPage.notConfigured}</p>
              <div className="flex flex-col">
                <a className="w-fit underline" href={`mailto:${site.contact.email}`}>
                  {site.contact.email}
                </a>
                {site.contact.phones.map((t) => (
                  <a key={t.href} className="w-fit underline" href={t.href}>
                    {t.label}
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
