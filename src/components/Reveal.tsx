"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef, type ElementType, type Ref, type RefObject } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";

/**
 * Entrance effects measured from the reference:
 *  - fade:            opacity 0→1, 1s, delay 0.3 (on mount)
 *  - split:           lines masked, yPercent 100→0 + opacity, 1.5s expo.out, stagger 0.2, delay 0.3 (on mount)
 *  - delayedFade/-Split: same, triggered when the element's top enters the viewport
 *  - separator:       width 0→100%, 1s power2.out, on enter
 *  - verticalSeparator: scaleY 0→1 from top, 1s power2.out, delay 0.3, on enter
 */
export type Effect = "fade" | "split" | "delayedFade" | "delayedSplit" | "separator" | "verticalSeparator";

type Props<T extends ElementType> = {
  as?: T;
  effect: Effect;
  delay?: number;
  duration?: number;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

export function Reveal<T extends ElementType = "div">({
  as,
  effect,
  delay,
  duration,
  ref: externalRef,
  ...rest
}: Props<T> & { ref?: Ref<HTMLElement | null> }) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);
  const setRef = (node: HTMLElement | null) => {
    ref.current = node;
    if (typeof externalRef === "function") externalRef(node);
    else if (externalRef) (externalRef as RefObject<HTMLElement | null>).current = node;
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.setAttribute("data-revealed", "");
      return;
    }

    let split: SplitText | undefined;
    let trigger: ScrollTrigger | undefined;
    let tween: gsap.core.Animation | undefined;
    let cancelled = false;

    const fade = () => {
      tween = gsap.fromTo(el, { opacity: 0 }, { opacity: 1, delay: delay ?? 0.3, duration: duration ?? 1 });
    };

    const splitLines = () => {
      document.fonts.ready.then(() => {
        if (cancelled) return;
        gsap.set(el, { opacity: 1 });
        split = SplitText.create(el, {
          type: "words,lines",
          linesClass: "split-line",
          mask: "lines",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              duration: duration ?? 1.5,
              delay: delay ?? 0.3,
              yPercent: 100,
              opacity: 0,
              stagger: 0.2,
              ease: "expo.out",
            }),
        });
      });
    };

    const onEnter = (fn: () => void) => {
      trigger = ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", once: true, onEnter: fn });
    };

    switch (effect) {
      case "fade":
        fade();
        break;
      case "split":
        splitLines();
        break;
      case "delayedFade":
        onEnter(fade);
        break;
      case "delayedSplit":
        onEnter(splitLines);
        break;
      case "separator":
        onEnter(() => {
          tween = gsap.fromTo(el, { opacity: 0, width: 0 }, { opacity: 1, width: "100%", duration: 1, ease: "power2.out" });
        });
        break;
      case "verticalSeparator":
        onEnter(() => {
          tween = gsap.fromTo(
            el,
            { opacity: 0, scaleY: 0, transformOrigin: "top center" },
            { opacity: 1, scaleY: 1, delay: delay ?? 0.3, duration: duration ?? 1, ease: "power2.out" },
          );
        });
        break;
    }

    return () => {
      cancelled = true;
      trigger?.kill();
      tween?.kill();
      split?.revert();
    };
  }, [effect, delay, duration]);

  return <Tag ref={setRef} data-effect={effect} {...rest} />;
}
