"use client";

import { trackEvent } from "@/lib/analytics";
import { setConsent, useConsent } from "@/lib/consent";

/**
 * El mapa de Google Maps instala cookies de Google: solo se carga con el
 * consentimiento de «Servicios de terceros». Sin él, un recuadro que lo explica
 * y deja cargarlo con un clic (eso también cuenta como consentimiento).
 */
export function ConsentMap({ src, title }: { src: string; title: string }) {
  const consent = useConsent();

  if (consent?.terceros) {
    return (
      <iframe
        title={title}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0 size-full border-0 grayscale-[0.9] sepia-[0.15]"
      />
    );
  }

  return (
    <div className="absolute inset-0 grid content-center justify-items-start gap-4 p-6 text-sm text-neutral-700 lg:p-10">
      <p className="max-w-[44ch]">
        El mapa es de Google Maps y, al cargarlo, Google puede instalar sus cookies. Solo lo mostramos si nos das permiso.
      </p>
      {consent !== undefined && (
        <button
          type="button"
          className="style-button min-h-12"
          onClick={() => {
            setConsent(true);
            trackEvent("Cookies", { decision: "ver mapa", terceros: true });
          }}
        >
          Aceptar y ver el mapa
        </button>
      )}
    </div>
  );
}
