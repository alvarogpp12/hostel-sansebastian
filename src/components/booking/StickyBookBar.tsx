"use client";

import { useEffect, useState } from "react";
import { Arrow } from "@/components/icons";
import { TransitionLink } from "@/components/TransitionLink";
import { site } from "@/content/site";

/**
 * Barra de reserva que aparece cuando el buscador del hero sale de pantalla
 * por arriba: en el móvil, fija abajo a todo el ancho; en escritorio, una
 * píldora centrada. Así el botón de reservar no se pierde nunca de vista.
 * Se esconde al llegar al bloque de reserva del final (ya tiene su buscador)
 * para no tapar ese bloque ni el pie.
 */
export function StickyBookBar({ watch }: { watch: string }) {
  const [pastTop, setPastTop] = useState(false);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const target = document.getElementById(watch);
    const band = document.querySelector("[data-booking-band]");
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const above = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        if (entry.target === target) setPastTop(above);
        else setAtEnd(entry.isIntersecting || above);
      }
    });
    if (target) io.observe(target);
    if (band) io.observe(band);
    return () => io.disconnect();
  }, [watch]);

  const visible = pastTop && !atEnd;

  // Avisa al botón flotante de WhatsApp para que suba por encima de la barra en el móvil.
  useEffect(() => {
    document.body.toggleAttribute("data-bookbar", visible);
    return () => document.body.removeAttribute("data-bookbar");
  }, [visible]);

  return (
    <div
      data-zona="barra fija"
      aria-hidden={!visible}
      inert={!visible}
      className={`fixed inset-x-0 bottom-0 z-30 transition-transform duration-300 lg:bottom-5 lg:flex lg:justify-center ${
        visible ? "translate-y-0" : "translate-y-[calc(100%+2rem)]"
      }`}
    >
      <div className="flex items-center gap-4 border-t border-neutral-200 bg-white px-w py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:rounded-full lg:border-0 lg:bg-black lg:py-2 lg:pr-2 lg:pl-6 lg:text-white lg:shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
        <p className="flex-1 text-sm leading-tight lg:flex-none">
          <span className="block font-medium lg:inline">Reserva directa</span>
          <span className="text-neutral-500 lg:text-neutral-300"> · {site.brand.slogan}</span>
        </p>
        <TransitionLink
          href="/reservar"
          className="style-button min-h-11 !px-6 lg:!bg-offwhite lg:!text-black"
        >
          Reservar
          <Arrow />
        </TransitionLink>
      </div>
    </div>
  );
}
