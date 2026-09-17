"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { EffectFade, Keyboard, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Arrow, ArrowBack } from "@/components/icons";
import { useLenis } from "@/components/providers/SmoothScroll";
import type { Media } from "@/content/media";
import { site } from "@/content/site";
import { gsap } from "@/lib/gsap";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/thumbs";

type Props = { open: boolean; onClose: () => void; title: string; meta: string; images: Media[] };

export function GalleryModal({ open, onClose, title, meta, images }: Props) {
  const lenis = useLenis();
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [main, setMain] = useState<SwiperType | null>(null);
  const [thumbs, setThumbs] = useState<SwiperType | null>(null);
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;
    if (open) {
      const previous = document.activeElement as HTMLElement | null;
      lenis?.stop();
      gsap.set(overlay, { display: "flex" });
      gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
      gsap.fromTo(panel, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: "expo.out", delay: 0.1 });
      closeRef.current?.focus();
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
        if (e.key === "Tab") {
          const focusables = panel.querySelectorAll<HTMLElement>("button, a[href]");
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
        previous?.focus();
      };
    }
    lenis?.start();
    gsap.to(overlay, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        gsap.set(overlay, { display: "none" });
        main?.slideTo(0, 0);
        setZoom(1);
      },
    });
  }, [open, lenis, onClose, main]);

  useEffect(() => {
    const img = main?.slides[main.activeIndex]?.querySelector("img");
    if (img) gsap.to(img, { scale: zoom, duration: 0.3, ease: "power2.out" });
  }, [zoom, main, index]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      aria-label={title}
      style={{ display: "none" }}
      className="fixed inset-0 z-[70] items-center justify-center bg-black/75 p-2 lg:p-w"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      data-lenis-prevent
    >
      <div ref={panelRef} className="grid max-h-full w-full max-w-[1215px] gap-4 overflow-auto rounded-lg bg-beige p-3 lg:p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-baseline gap-x-4">
            <h2 className="style-heading text-lg lg:text-xl">{title}</h2>
            <p className="style-caption-xs font-light">{meta}</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} className="style-button shrink-0">
            <ArrowBack />
            {site.ui.close}
          </button>
        </div>

        <div className="relative overflow-hidden rounded-lg bg-neutral-300">
          <Swiper
            modules={[EffectFade, Keyboard, Thumbs]}
            loop
            effect="fade"
            fadeEffect={{ crossFade: true }}
            allowTouchMove={false}
            keyboard={{ enabled: open, onlyInViewport: false }}
            thumbs={{ swiper: thumbs && !thumbs.destroyed ? thumbs : null }}
            onSwiper={setMain}
            onSlideChange={(s) => {
              setIndex(s.realIndex);
              setZoom(1);
            }}
            className="aspect-[3/4] w-full sm:aspect-[1175/634]"
          >
            {images.map((image, i) => (
              <SwiperSlide key={image.src} className="overflow-hidden">
                <Image src={image.src} alt={image.alt || `${title} ${i + 1}`} fill sizes="(min-width: 1280px) 1175px, 100vw" className="object-cover" />
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1">
            <button type="button" aria-label="Anterior" onClick={() => main?.slidePrev()} className="map-button !size-9">
              <ArrowBack />
            </button>
            <span className="rounded-full border border-black/10 bg-white px-5 py-1.5 font-caption text-xs tracking-[0.1em]">
              {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
            </span>
            <button type="button" aria-label="Siguiente" onClick={() => main?.slideNext()} className="map-button !size-9">
              <Arrow />
            </button>
          </div>
          <div className="absolute right-3 bottom-3 z-10 flex gap-1 max-sm:hidden">
            <button type="button" aria-label="Acercar" onClick={() => setZoom((z) => Math.min(5, z + 0.5))} className="map-button">
              <span aria-hidden="true" className="text-lg leading-none">+</span>
            </button>
            <button type="button" aria-label="Alejar" onClick={() => setZoom((z) => Math.max(1, z - 0.5))} className="map-button">
              <span aria-hidden="true" className="text-lg leading-none">−</span>
            </button>
          </div>
        </div>

        <Swiper
          modules={[Thumbs]}
          onSwiper={setThumbs}
          slidesPerView="auto"
          spaceBetween={14}
          watchSlidesProgress
          className="w-full"
        >
          {images.map((image, i) => (
            <SwiperSlide key={image.src} className="!w-[62px] cursor-pointer">
              <div
                className={`relative aspect-square overflow-hidden rounded border transition-opacity duration-300 ${
                  i === index ? "border-black opacity-100" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={image.src} alt="" fill sizes="62px" className="object-cover" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>,
    document.body,
  );
}
