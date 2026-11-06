"use client";

import { useEffect, useId, useRef, useState } from "react";
import { TransitionLink } from "@/components/TransitionLink";
import { trackEvent } from "@/lib/analytics";
import { type ConsentChoice, onOpenCookieSettings, setConsent, useConsent } from "@/lib/consent";
import { getDict } from "@/content/i18n";
import { useLocale } from "@/i18n/useLocale";

/**
 * Aviso de cookies (guía de la AEPD): sale hasta que se decide, con «Aceptar»
 * y «Rechazar» al mismo nivel, y «Configurar» para elegir por categorías. Lo
 * reabre el enlace «Configurar cookies» del pie.
 */
export function CookieBanner() {
  const consent = useConsent();
  const t = getDict(useLocale()).cookies;
  const [reopened, setReopened] = useState(false);
  const [settings, setSettings] = useState(false);
  const [thirdParty, setThirdParty] = useState(false);
  const [measurement, setMeasurement] = useState(false);
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const open = consent !== undefined && (consent === null || reopened);

  // Mientras está abierto, el botón de WhatsApp sube por encima en el móvil
  // (ver WhatsAppButton): se publica su altura en una variable CSS del body.
  useEffect(() => {
    const el = ref.current;
    if (!open || !el) return;
    const body = document.body;
    const sync = () => body.style.setProperty("--cookie-banner-h", `${el.offsetHeight}px`);
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    body.dataset.cookies = "";
    return () => {
      observer.disconnect();
      delete body.dataset.cookies;
      body.style.removeProperty("--cookie-banner-h");
    };
  }, [open, settings]);

  useEffect(
    () =>
      onOpenCookieSettings(() => {
        setThirdParty(consent?.terceros ?? false);
        setMeasurement(consent?.medicion ?? false);
        setSettings(true);
        setReopened(true);
      }),
    [consent],
  );

  // undefined: aún sin hidratar. Con una decisión guardada, solo si se reabre.
  if (!open) return null;

  const decide = (choice: ConsentChoice, decision: "aceptar" | "rechazar" | "guardar") => {
    setConsent(choice);
    trackEvent("Cookies", { decision, terceros: choice.terceros });
    setReopened(false);
    setSettings(false);
  };

  const button = "style-button min-h-11 flex-1 justify-center";

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      data-lenis-prevent
      className="fixed inset-x-4 bottom-4 z-[80] grid max-w-md gap-4 rounded-lg bg-white p-5 text-sm text-neutral-700 shadow-[0_8px_40px_rgba(0,0,0,0.18)] sm:right-auto sm:left-6 sm:bottom-6 lg:p-6"
    >
      <div className="grid gap-2">
        <h2 id={titleId} className="style-heading text-xl text-black">
          {t.title}
        </h2>
        <p>
          {t.text}{" "}
          <TransitionLink href="/cookies" className="underline">
            {t.policy}
          </TransitionLink>
        </p>
      </div>

      {settings && (
        <ul className="grid gap-3 border-t border-neutral-200 pt-4">
          <li className="flex items-start justify-between gap-4">
            <span>
              <span className="block text-black">{t.technical}</span>
              <span className="text-xs text-neutral-500">{t.technicalText}</span>
            </span>
            <span className="style-caption-xs shrink-0 pt-0.5 text-neutral-500">{t.active}</span>
          </li>
          <li>
            <label className="flex cursor-pointer items-start justify-between gap-4">
              <span>
                <span className="block text-black">{t.measurement}</span>
                <span className="text-xs text-neutral-500">{t.measurementText}</span>
              </span>
              <input
                type="checkbox"
                role="switch"
                checked={measurement}
                onChange={(e) => setMeasurement(e.target.checked)}
                className="relative mt-0.5 h-6 w-11 shrink-0 cursor-pointer appearance-none rounded-full bg-neutral-300 transition-colors before:absolute before:top-0.5 before:left-0.5 before:size-5 before:rounded-full before:bg-white before:transition-transform checked:bg-black checked:before:translate-x-5"
              />
            </label>
          </li>
          <li>
            <label className="flex cursor-pointer items-start justify-between gap-4">
              <span>
                <span className="block text-black">{t.thirdParty}</span>
                <span className="text-xs text-neutral-500">{t.thirdPartyText}</span>
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
          <button type="button" className={button} onClick={() => decide({ terceros: thirdParty, medicion: measurement }, "guardar")}>
            {t.save}
          </button>
        ) : (
          <>
            <button type="button" className={button} onClick={() => decide({ terceros: false, medicion: false }, "rechazar")}>
              {t.reject}
            </button>
            <button type="button" className={button} onClick={() => decide({ terceros: true, medicion: true }, "aceptar")}>
              {t.accept}
            </button>
          </>
        )}
        {!settings && (
          <button type="button" className="w-full pt-1 text-xs underline" onClick={() => setSettings(true)}>
            {t.configure}
          </button>
        )}
      </div>
    </div>
  );
}
