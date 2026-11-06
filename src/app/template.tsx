"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/sections/Footer";
import { Header } from "@/components/header/Header";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { useLenis } from "@/components/providers/SmoothScroll";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { localeFromPath } from "@/i18n/config";

/**
 * A template re-mounts on every navigation, so the whole view (header,
 * page, footer) is replaced and fades in exactly like the reference router.
 */
export default function Template({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const pathname = usePathname();

  // <html lang> del idioma de la página (el layout raíz lo pinta en español)
  useLayoutEffect(() => {
    document.documentElement.lang = localeFromPath(pathname);
  }, [pathname]);

  useLayoutEffect(() => {
    lenis?.scrollTo(0, { immediate: true, force: true });
    const tween = gsap.fromTo(ref.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 350);
    return () => {
      tween.kill();
      window.clearTimeout(refresh);
    };
  }, [lenis, pathname]);

  return (
    <>
      <div ref={ref} data-page-view>
        <Header />
        {children}
        <Footer />
      </div>
      <WhatsAppButton />
    </>
  );
}
