"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { Arrow, ArrowBack } from "@/components/icons";
import { useLenis } from "@/components/providers/SmoothScroll";
import type { Media } from "@/content/media";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  meta: string;
  images: Media[];
  /** Foto con la que se abre (por ejemplo, la que se ha tocado) */
  startIndex?: number;
};

const noop = () => () => {};

/**
 * Visor de fotos a pantalla completa sobre fondo oscuro. Cada foto se ve
 * entera (object-contain), sea horizontal o vertical: nunca se recorta.
 *  - Flechas a los lados, ← → del teclado y deslizar con el dedo.
 *  - Miniaturas abajo; la activa se centra sola.
 *  - Esc o el botón de cerrar devuelven el foco a donde estaba.
 */
export function GalleryModal({ open, onClose, title, meta, images, startIndex = 0 }: Props) {
  const lenis = useLenis();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const thumbsRef = useRef<HTMLUListElement>(null);
  const swipeX = useRef<number | null>(null);
  const [index, setIndex] = useState(startIndex);
  const mounted = useSyncExternalStore(noop, () => true, () => false);

  const count = images.length;
  const go = useCallback((step: number) => setIndex((i) => (i + step + count) % count), [count]);
  // Al cerrar se vuelve a la primera foto para la próxima vez
  const close = useCallback(() => {
    setIndex(startIndex);
    onClose();
  }, [onClose, startIndex]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const root = document.documentElement;
    lenis?.stop();
    root.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Tab") {
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>("button");
        if (!focusables?.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      root.style.overflow = "";
      lenis?.start();
      previous?.focus();
    };
  }, [open, lenis, close, go]);

  // La miniatura activa siempre a la vista
  useEffect(() => {
    if (!open) return;
    thumbsRef.current?.children[index]?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [open, index]);

  if (!mounted || !open) return null;

  const current = images[index];
  const onPointerDown = (e: PointerEvent) => {
    swipeX.current = e.clientX;
  };
  const onPointerUp = (e: PointerEvent) => {
    if (swipeX.current === null) return;
    const dx = e.clientX - swipeX.current;
    swipeX.current = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  };

  const navButton =
    "absolute top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/25 lg:size-14";

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Fotos: ${title}`}
      data-lenis-prevent
      className="fixed inset-0 z-[70] flex animate-[gallery-fade_0.25s_ease-out] flex-col bg-neutral-950 text-white"
    >
      <header className="flex items-center gap-4 px-4 pt-3 pb-2 lg:px-8 lg:pt-6">
        <div className="min-w-0 flex-1">
          <h2 className="style-heading truncate text-lg lg:text-2xl">{title}</h2>
          <p className="style-caption-xs truncate !font-light text-neutral-400">{meta}</p>
        </div>
        <p aria-live="polite" className="font-caption text-sm text-neutral-300 tabular-nums">
          {index + 1} / {count}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={close}
          aria-label="Cerrar fotos"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/25"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </header>

      {/* Escenario: la foto entera, centrada, con el máximo tamaño que cabe */}
      <div
        className="relative min-h-0 flex-1 touch-pan-y select-none"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (swipeX.current = null)}
      >
        <div key={current.src} className="absolute inset-2 animate-[gallery-fade_0.3s_ease-out] sm:inset-x-20 lg:inset-x-28 lg:inset-y-4">
          <Image src={current.src} alt={current.alt} fill sizes="100vw" preload loading="eager" draggable={false} className="object-contain" />
        </div>
        {count > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Foto anterior" className={`${navButton} left-3 lg:left-8`}>
              <ArrowBack className="size-5" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Foto siguiente" className={`${navButton} right-3 lg:right-8`}>
              <Arrow className="size-5" />
            </button>
          </>
        )}
        {/* Precarga la anterior y la siguiente para que el cambio sea instantáneo */}
        {count > 1 &&
          [images[(index + 1) % count], images[(index - 1 + count) % count]].map((img) => (
            <Image key={`pre-${img.src}`} src={img.src} alt="" fill sizes="100vw" loading="eager" aria-hidden="true" className="invisible" />
          ))}
      </div>

      <p className="px-4 pt-2 text-center text-sm text-neutral-400 lg:px-8">{current.alt}</p>

      {count > 1 && (
        <ul
          ref={thumbsRef}
          aria-label="Miniaturas"
          className="flex gap-2 overflow-x-auto px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] [scrollbar-width:none] lg:justify-center lg:px-8 lg:pb-6"
        >
          {images.map((img, i) => (
            <li key={img.src} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Foto ${i + 1} de ${count}`}
                aria-current={i === index}
                className={`relative block size-14 overflow-clip rounded-md transition-opacity lg:size-16 ${
                  i === index ? "opacity-100 ring-2 ring-white ring-offset-2 ring-offset-neutral-950" : "opacity-45 hover:opacity-80"
                }`}
              >
                <Image src={img.src} alt="" fill sizes="64px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>,
    document.body,
  );
}
