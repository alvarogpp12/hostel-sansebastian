"use client";

import { useEffect, useId, useState } from "react";
import { TransitionLink } from "@/components/TransitionLink";
import { trackEvent } from "@/lib/analytics";
import { onOpenCookieSettings, setConsent, useConsent } from "@/lib/consent";

/**
 * Aviso de cookies (guía de la AEPD): sale hasta que se decide, con «Aceptar»
 * y «Rechazar» al mismo nivel, y «Configurar» para elegir por categorías. Lo
 * reabre el enlace «Configurar cookies» del pie.
 */
export function CookieBanner() {
  const consent = useConsent();
  const [reopened, setReopened] = useState(false);
  const [settings, setSettings] = useState(false);
  const [thirdParty, setThirdParty] = useState(false);
  const titleId = useId();

  useEffect(
    () =>
      onOpenCookieSettings(() => {
        setThirdParty(consent?.terceros ?? false);
        setSettings(true);
        setReopened(true);
      }),
    [consent],
  );

  // undefined: aún sin hidratar. Con una decisión guardada, solo si se reabre.
  if (consent === undefined || (consent !== null && !reopened)) return null;

  const decide = (terceros: boolean, decision: "aceptar" | "rechazar" | "guardar") => {
    setConsent(terceros);
    trackEvent("Cookies", { decision, terceros });
    setReopened(false);
    setSettings(false);
  };

  const button = "style-button min-h-11 flex-1 justify-center";

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      data-lenis-prevent
      className="fixed inset-x-4 bottom-4 z-[80] grid max-w-md gap-4 rounded-lg bg-white p-5 text-sm text-neutral-700 shadow-[0_8px_40px_rgba(0,0,0,0.18)] sm:right-auto sm:left-6 sm:bottom-6 lg:p-6"
    >
      <div className="grid gap-2">
        <h2 id={titleId} className="style-heading text-xl text-black">
          Cookies
        </h2>
        <p>
          Usamos solo lo técnico para que la web funcione y estadísticas anónimas, sin cookies. Con tu permiso cargamos
          servicios de terceros, como el mapa de Google Maps, que instala sus propias cookies.{" "}
          <TransitionLink href="/cookies" className="underline">
            Política de cookies
          </TransitionLink>
        </p>
      </div>

      {settings && (
        <ul className="grid gap-3 border-t border-neutral-200 pt-4">
          <li className="flex items-start justify-between gap-4">
            <span>
              <span className="block text-black">Técnicas</span>
              <span className="text-xs text-neutral-500">Necesarias para que la web funcione. Siempre activas.</span>
            </span>
            <span className="style-caption-xs shrink-0 pt-0.5 text-neutral-500">Activas</span>
          </li>
          <li>
            <label className="flex cursor-pointer items-start justify-between gap-4">
              <span>
                <span className="block text-black">Servicios de terceros</span>
                <span className="text-xs text-neutral-500">Mapa de Google Maps en la página de Ubicación.</span>
              </span>
              <input
                type="checkbox"
                role="switch"
                checked={thirdParty}
                onChange={(e) => setThirdParty(e.target.checked)}
                className="relative mt-0.5 h-6 w-11 shrink-0 cursor-pointer appearance-none rounded-full bg-neutral-300 transition-colors before:absolute before:top-0.5 before:left-0.5 before:size-5 before:rounded-full before:bg-white before:transition-transform checked:bg-black checked:before:translate-x-5"
              />
            </label>
          </li>
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        {settings ? (
          <button type="button" className={button} onClick={() => decide(thirdParty, "guardar")}>
            Guardar
          </button>
        ) : (
          <>
            <button type="button" className={button} onClick={() => decide(false, "rechazar")}>
              Rechazar
            </button>
            <button type="button" className={button} onClick={() => decide(true, "aceptar")}>
              Aceptar
            </button>
          </>
        )}
        {!settings && (
          <button type="button" className="w-full pt-1 text-xs underline" onClick={() => setSettings(true)}>
            Configurar
          </button>
        )}
      </div>
    </div>
  );
}
