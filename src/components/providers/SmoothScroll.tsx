"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Draggable, gsap, ScrollTrigger } from "@/lib/gsap";

const LenisContext = createContext<Lenis | null>(null);

export const useLenis = () => useContext(LenisContext);

/**
 * Lenis smooth scrolling driven by the GSAP ticker (same wiring as the
 * reference) plus the small draggable scrollbar thumb shown on desktop.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const instance = new Lenis({ smoothWheel: true });
    // Lenis needs `window`, so it can only be created client-side, after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLenis(instance);
    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "PageUp" && e.key !== "PageDown") return;
      e.preventDefault();
      const delta = e.key === "PageUp" ? -window.innerHeight : window.innerHeight;
      instance.scrollTo(Math.min(instance.limit, Math.max(0, instance.scroll + delta)), { duration: 0.8 });
    };
    document.addEventListener("keydown", onKey);

    const track = trackRef.current;
    const thumb = thumbRef.current;
    let drag: Draggable[] = [];
    if (track && thumb) {
      const range = () => track.clientHeight - thumb.clientHeight;
      instance.on("scroll", ({ scroll, limit }: Lenis) => {
        gsap.set(thumb, { y: limit ? (scroll / limit) * range() : 0 });
      });
      drag = Draggable.create(thumb, {
        type: "y",
        bounds: track,
        onDrag() {
          instance.scrollTo((this.y / range()) * instance.limit, { immediate: true });
        },
      });
    }

    return () => {
      document.removeEventListener("keydown", onKey);
      drag.forEach((d) => d.kill());
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return (
    <LenisContext.Provider value={lenis}>
      {children}
      <div aria-hidden="true" className="scrollbar">
        <div ref={trackRef} className="relative h-full">
          <div ref={thumbRef} className="scrollbar-thumb" />
        </div>
      </div>
    </LenisContext.Provider>
  );
}
