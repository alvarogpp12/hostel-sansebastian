import type { Metadata } from "next";
import { Suspense } from "react";
import { Reveal } from "@/components/Reveal";
import { RedfortsBooking } from "@/components/booking/RedfortsBooking";
import { BookingForm } from "@/components/sections/BookingForm";
import { bookingProvider } from "@/content/booking";
import { bookingPage } from "@/content/pages";
import { site } from "@/content/site";
import { isRedfortsConfigured } from "@/lib/redforts/client";
import { getInventory, toPublicInventory, type PublicInventory } from "@/lib/redforts/inventory";

export const metadata: Metadata = {
  title: "Reservar habitación en San Sebastián",
  description:
    "Reserva online en nuestro alojamiento céntrico de San Sebastián: elige habitación y fechas, consulta la disponibilidad real y confirma al momento. Reserva directa sin comisiones.",
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
    <main id="content" className="p-w pt-32">
      <div className="rounded-lg bg-white p-6 lg:p-w lg:py-16">
        <div className="mb-10 grid gap-2">
          <Reveal as="h1" effect="split" delay={0.2} className="style-heading text-2xl lg:text-3xl">
            {bookingPage.formTitle}
          </Reveal>
          <Reveal as="p" effect="fade" delay={0.4} className="max-w-[60ch]">
            {bookingPage.formIntro}
          </Reveal>
        </div>
        <Reveal effect="fade" delay={0.5}>
          {provider === "legacy" ? (
            <Suspense fallback={null}>
              <BookingForm />
            </Suspense>
          ) : inventory ? (
            <RedfortsBooking inventory={inventory} />
          ) : (
            <div className="grid gap-3 border border-neutral-300 p-4 text-sm">
              <p>{bookingPage.notConfigured}</p>
              <div className="flex flex-col">
                <a className="w-fit underline" href={`mailto:${site.contact.email}`}>
                  {site.contact.email}
                </a>
                <a className="w-fit underline" href={site.contact.phoneHref}>
                  {site.contact.phoneLabel}
                </a>
              </div>
            </div>
          )}
        </Reveal>
      </div>
    </main>
  );
}
