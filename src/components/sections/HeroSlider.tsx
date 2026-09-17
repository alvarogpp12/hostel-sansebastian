"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Autoplay, EffectFade, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import type { Media } from "@/content/media";
import { gsap } from "@/lib/gsap";
import "swiper/css";
import "swiper/css/effect-fade";

/**
 * Full-bleed cover slider: crossfade (700ms), autoplay 5s, progress-bar
 * pagination and a slow 1.05→1 zoom synced to the autoplay timer.
 */
export function HeroSlider({
  slides,
  className = "",
  paginationClassName = "",
  priority,
}: {
  slides: Media[];
  className?: string;
  paginationClassName?: string;
  priority?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const bulletsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    gsap.to(rootRef.current, { opacity: 1, duration: 3, ease: "power2.out" });
  }, []);

  const activeImg = (s: SwiperType) => s.slides[s.activeIndex]?.querySelector("img");

  return (
    <div ref={rootRef} className={`relative size-full opacity-0 ${className}`}>
      <Swiper
        modules={[EffectFade, Autoplay, Keyboard]}
        loop
        speed={700}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        grabCursor
        keyboard={{ enabled: true, onlyInViewport: false }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        className="size-full"
        onSwiper={setSwiper}
        onInit={(s) => {
          s.slides.forEach((slide) => gsap.set(slide.querySelector("img"), { scale: slide === s.slides[s.activeIndex] ? 1.1 : 1 }));
        }}
        onSlideChange={(s) => setActive(s.realIndex)}
        onSlideChangeTransitionStart={(s) => {
          const prev = s.slides[s.previousIndex]?.querySelector("img");
          if (prev) gsap.to(prev, { scale: 1, duration: 0.3, ease: "power2.out", overwrite: true });
        }}
        onAutoplayTimeLeft={(s, _ms, progress) => {
          const done = 1 - progress;
          bulletsRef.current.forEach((b, i) => b?.style.setProperty("--timescale", String(i === s.realIndex ? done : 0)));
          const img = activeImg(s);
          if (img) gsap.to(img, { scale: 1.05 - 0.05 * done, duration: 0.3, ease: "power1.out", overwrite: true });
        }}
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={slide.src} className="isolate !h-full !w-full">
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              sizes="100vw"
              priority={priority && i === 0}
              className="size-full scale-105 object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className={`slider-pagination ${paginationClassName}`}>
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            ref={(el) => {
              bulletsRef.current[i] = el;
            }}
            type="button"
            aria-label={`Ir a la imagen ${i + 1}`}
            aria-current={active === i}
            className="slider-bullet"
            onClick={() => swiper?.slideToLoop(i)}
          />
        ))}
      </div>
      <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 h-32 w-full bg-gradient-to-b from-neutral-900 to-transparent opacity-70" />
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-[320px] w-full bg-gradient-to-t from-neutral-900 to-transparent lg:h-96 lg:opacity-80" />
    </div>
  );
}
