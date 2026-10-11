import type { Metadata } from "next";
import { MyReservation } from "./MyReservation";

export const metadata: Metadata = {
  title: "Mi reserva",
  robots: { index: false, follow: false },
};

export default function MyReservationPage() {
  return (
    <main id="content" className="p-w pt-32">
      <div className="rounded-lg bg-white p-6 lg:p-w lg:py-16">
        <div className="mb-10 grid gap-2">
          <h1 className="style-heading text-2xl lg:text-3xl">Mi reserva</h1>
          <p className="max-w-[60ch]">Consulta tu reserva y añade extras con el número de reserva, la fecha de llegada y tu email.</p>
        </div>
        <MyReservation />
      </div>
    </main>
  );
}
