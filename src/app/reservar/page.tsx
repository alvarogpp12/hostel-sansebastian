import type { Metadata } from "next";
import { Suspense } from "react";
import { Reveal } from "@/components/Reveal";
import { BookingForm } from "@/components/sections/BookingForm";
import { bookingPage } from "@/content/pages";

export const metadata: Metadata = {
  title: "Reservar habitación en San Sebastián",
  description:
    "Reserva online en nuestro hostal barato de San Sebastián: elige habitación y fechas, paga la señal y recibe la confirmación al instante. Reserva directa sin comisiones.",
  alternates: { canonical: "/reservar" },
};

export default function BookingPage() {
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
          <Suspense fallback={null}>
            <BookingForm />
          </Suspense>
        </Reveal>
      </div>
    </main>
  );
}
