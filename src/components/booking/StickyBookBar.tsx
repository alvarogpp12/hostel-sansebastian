"use client";

import { useEffect, useState } from "react";
import { Arrow } from "@/components/icons";
import { TransitionLink } from "@/components/TransitionLink";
import { site } from "@/content/site";

/**
 * Barra de reserva que aparece cuando el buscador del hero sale de pantalla
 * por arriba: en el móvil, fija abajo a todo el ancho; en escritorio, una
 * píldora centrada. Así el botón de reservar no se pierde nunca de vista.
 */
export function StickyBookBar({ watch }: { watch: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById(watch);
    if (!target) return;
    const io = new IntersectionObserver(([entry]) => {
      setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    io.observe(target);
    return () => io.disconnect();
  }, [watch]);

  return (
    <div
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
          className="style-button min-h-11 !px-6 lg:!bg-beige lg:!text-black"
        >
          Reservar
          <Arrow />
        </TransitionLink>
      </div>
    </div>
  );
}
