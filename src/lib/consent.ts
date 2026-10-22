"use client";

import { useSyncExternalStore } from "react";

/**
 * Consentimiento de cookies. La única categoría opcional son los servicios de
 * terceros que instalan sus cookies (el mapa de Google Maps). Lo técnico y las
 * estadísticas de Vercel (sin cookies ni datos personales) no lo necesitan.
 *
 * Se guarda en localStorage y caduca al año: entonces se vuelve a preguntar.
 */

export type Consent = { terceros: boolean; fecha: string };

const KEY = "ec-cookies";
const CHANGE = "ec-cookies-cambio";
const OPEN = "ec-cookies-abrir";
const MAX_AGE = 365 * 86_400_000;

// undefined = aún sin leer; null = sin decidir (o caducado)
let cache: Consent | null | undefined;

function read(): Consent | null {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? "null") as Consent | null;
    if (!value || typeof value.terceros !== "boolean") return null;
    if (Date.now() - Date.parse(value.fecha) > MAX_AGE) return null;
    return value;
  } catch {
    return null;
  }
}

function getSnapshot(): Consent | null {
  if (cache === undefined) cache = read();
  return cache;
}

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    cache = undefined;
    onChange();
  };
  window.addEventListener(CHANGE, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function setConsent(terceros: boolean) {
  cache = { terceros, fecha: new Date().toISOString() };
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // Navegación privada o almacenamiento bloqueado: vale para esta visita.
  }
  window.dispatchEvent(new Event(CHANGE));
}

/** `undefined` en el servidor y antes de hidratar: no pintar nada que dependa de ello */
export function useConsent(): Consent | null | undefined {
  return useSyncExternalStore(subscribe, getSnapshot, () => undefined);
}

/** Abre el panel de configuración (enlace «Configurar cookies» del pie) */
export const openCookieSettings = () => window.dispatchEvent(new Event(OPEN));
export const onOpenCookieSettings = (cb: () => void) => {
  window.addEventListener(OPEN, cb);
  return () => window.removeEventListener(OPEN, cb);
};
