import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { ButtonLink } from "@/components/ui";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Reserva recibida",
  robots: { index: false, follow: false },
};

/**
 * Página a la que Stripe devuelve al huésped tras pagar.
 *
 * Deliberadamente NO dice "reserva confirmada": quien confirma es el webhook,
 * cuando ha comprobado la disponibilidad en Beds24 y ha creado la reserva. El
 * huésped puede llegar aquí un instante antes de que eso ocurra, así que el
 * texto promete lo que sí es cierto: que el pago se ha recibido y que la
 * confirmación llega por email.
 */
export default function BookingReceivedPage() {
  return (
    <main id="content" className="p-w pt-32">
      <div className="mx-auto grid max-w-2xl gap-6 rounded-lg bg-white p-6 lg:p-w lg:py-16">
        <Reveal as="h1" effect="split" className="style-heading text-2xl lg:text-3xl">
          Hemos recibido tu pago
        </Reveal>
        <Reveal effect="fade" delay={0.4} className="grid gap-4">
          <p>
            Estamos confirmando tu reserva. En unos minutos recibirás un email con los datos de la estancia y el
            justificante del pago.
          </p>
          <p>
            Ese mismo email incluye un enlace para hacer el registro de viajeros, que es obligatorio por ley y te
            ahorra trámites al llegar.
          </p>
          <p className="text-sm text-neutral-600">
            Si no te llega nada en una hora, revisa la carpeta de spam o escríbenos a{" "}
            <a className="underline" href={`mailto:${site.contact.email}`}>
              {site.contact.email}
            </a>{" "}
            y lo miramos.
          </p>
        </Reveal>
        <Reveal effect="fade" delay={0.6}>
          <ButtonLink href="/">Volver al inicio</ButtonLink>
        </Reveal>
      </div>
    </main>
  );
}
