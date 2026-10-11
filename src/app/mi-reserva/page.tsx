import type { Metadata } from "next";
import { PageIntro } from "@/components/sections/Page";
import { MyReservation } from "./MyReservation";

export const metadata: Metadata = {
  title: "Mi reserva",
  robots: { index: false, follow: false },
};

export default function MyReservationPage() {
  return (
    <main id="content" className="pb-16">
      <PageIntro
        eyebrow="Reserva directa"
        title="Mi reserva"
        intro={<p>Consulta tu reserva y añade extras con el número de reserva, la fecha de llegada y tu email.</p>}
      />
      <div className="mx-w rounded-lg bg-white p-5 lg:p-12">
        <MyReservation />
      </div>
    </main>
  );
}
