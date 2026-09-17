"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Logo } from "@/components/brand/Logo";
import { SocialGlyph } from "@/components/icons";
import { useLenis } from "@/components/providers/SmoothScroll";
import { Reveal } from "@/components/Reveal";
import { TransitionLink } from "@/components/TransitionLink";
import { site } from "@/content/site";
import { gsap } from "@/lib/gsap";

/** Routes whose first section is a full-bleed dark photo (white header) */
const DARK_HERO_ROUTES = ["/"];

export function Header() {
  const pathname = usePathname();
  const lenis = useLenis();
  const dark = DARK_HERO_ROUTES.includes(pathname);

  const sloganRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const altLogoRef = useRef<HTMLAnchorElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isOpen = useRef(false);

  /* Scrolled state: slogan + logo fade out, round logo fades in, menu turns black */
  useEffect(() => {
    if (!lenis) return;
    gsap.set(altLogoRef.current, { autoAlpha: 0 });
    const tl = gsap
      .timeline({ paused: true })
      .to([sloganRef.current, logoRef.current], { autoAlpha: 0, overwrite: true }, 0)
      .to(altLogoRef.current, { autoAlpha: 1, overwrite: true }, 0.5)
      .to(toggleRef.current, { color: "#fff", backgroundColor: "#000" }, 0.5);
    const onScroll = ({ scroll }: { scroll: number }) => {
      const threshold = window.innerWidth > 900 ? 20 : 10;
      if (scroll > threshold) tl.play();
      else tl.reverse();
    };
    lenis.on("scroll", onScroll);
    return () => {
      lenis.off("scroll", onScroll);
      tl.kill();
    };
  }, [lenis]);

  /* Menu open/close timeline (timings from the reference) */
  useEffect(() => {
    const nav = navRef.current;
    const wrapper = wrapperRef.current;
    const toggle = toggleRef.current;
    if (!nav || !wrapper || !toggle) return;

    let tl: gsap.core.Timeline;
    let desktop = window.innerWidth > 768;

    const size = () =>
      window.innerWidth > 768
        ? { width: 586, height: 344 }
        : { width: document.documentElement.clientWidth - 16, height: window.innerHeight - 16 };

    const q = gsap.utils.selector(nav);

    const build = () => {
      tl?.kill();
      desktop = window.innerWidth > 768;
      const [top, mid1, mid2, bottom] = ["#line-top", "#line-mid-1", "#line-mid-2", "#line-bottom"].map((s) => q(s)[0]);
      const separator = q("[data-menu-separator]");
      const clones = q("[data-menu-info] .clone");
      const contact = q("[data-menu-contact] a");
      const links = q("[data-menu-nav] li");
      const social = q("[data-menu-social] li");

      gsap.set([mid1, mid2], { transformOrigin: "50% 50%" });
      gsap.set(mid2, { opacity: 0 });
      gsap.set(clones, { yPercent: 110 });
      gsap.set(contact, { autoAlpha: 0 });
      gsap.set([links, social], { autoAlpha: 0, y: 8 });
      gsap.set(separator, desktop ? { scaleY: 0, scaleX: 1, transformOrigin: "top" } : { scaleX: 0, scaleY: 1, transformOrigin: "left center" });

      tl = gsap
        .timeline({ paused: true })
        .set(wrapper, { display: "grid", opacity: 0, width: 0, height: 0 }, 0)
        .to(wrapper, { opacity: 1, width: () => size().width, height: () => size().height }, 0)
        .to([top, bottom], { opacity: 0, duration: 0.2, ease: "power2.out" }, 0)
        .to(mid1, { rotation: 45, duration: 0.4, ease: "power2.out" }, 0)
        .to(mid2, { opacity: 1, rotation: -45, duration: 0.4, ease: "power2.out" }, 0)
        .to(toggle, { color: "#fff" }, 0.5);

      if (desktop) {
        tl.to(clones, { yPercent: 0, duration: 0.8, ease: "power3.out", stagger: 0.1 }, 0.65)
          .to(contact, { autoAlpha: 1, duration: 0.5, ease: "power2.out", stagger: 0.1 }, 0.9)
          .to(separator, { scaleY: 1, duration: 0.8, ease: "power2.out" }, 1.1)
          .to(links, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.09 }, 1.3)
          .to(social, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.09 }, 1.9);
      } else {
        tl.to(links, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.07 }, 0.5)
          .to(separator, { scaleX: 1, duration: 0.5, ease: "power2.out" }, 0.85)
          .to(clones, { yPercent: 0, duration: 0.6, ease: "power3.out", stagger: 0.08 }, 0.95)
          .to(contact, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.08 }, 1.3)
          .to(social, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.07 }, 1.5);
      }
    };

    const open = () => {
      isOpen.current = true;
      document.body.classList.add("has-menu");
      toggle.setAttribute("aria-expanded", "true");
      lenis?.stop();
      tl.timeScale(1).invalidate().play();
    };
    const close = () => {
      isOpen.current = false;
      document.body.classList.remove("has-menu");
      toggle.setAttribute("aria-expanded", "false");
      lenis?.start();
      tl.timeScale(2).reverse();
    };

    build();

    const onToggle = () => (isOpen.current ? close() : open());
    const onDocClick = (e: MouseEvent) => {
      if (isOpen.current && !nav.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen.current) close();
    };
    let resizeTimer: number;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        const nowDesktop = window.innerWidth > 768;
        if (nowDesktop !== desktop && !isOpen.current) build();
        else if (isOpen.current) gsap.set(wrapper, size());
      }, 100);
    };

    toggle.addEventListener("click", onToggle);
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      toggle.removeEventListener("click", onToggle);
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      document.body.classList.remove("has-menu");
      lenis?.start();
      tl.kill();
    };
  }, [lenis]);

  const tone = dark ? "text-white" : "text-black";

  return (
    <>
      <a href="#content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:bg-white focus:p-2">
        {site.ui.skipToContent}
      </a>

      <div ref={sloganRef} className={`fixed top-w left-w z-40 flex items-center gap-2 max-lg:hidden ${tone}`}>
        <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M12 3.5c.9 4.6 3.9 7.6 8.5 8.5-4.6.9-7.6 3.9-8.5 8.5-.9-4.6-3.9-7.6-8.5-8.5 4.6-.9 7.6-3.9 8.5-8.5Z" strokeLinejoin="round" />
        </svg>
        <Reveal as="span" effect="split" delay={0.5} className="style-caption-xs font-medium">
          {site.brand.slogan}
        </Reveal>
      </div>

      <TransitionLink
        ref={logoRef}
        href="/"
        aria-label={site.brand.name}
        className={`fixed top-6 left-w z-40 lg:top-10 lg:left-1/2 lg:-translate-x-1/2 ${tone}`}
      >
        <Logo variant="full" tone={dark ? "light" : "dark"} priority alt={site.brand.name} className="h-8 w-auto lg:h-10" />
      </TransitionLink>

      <TransitionLink
        ref={altLogoRef}
        href="/"
        aria-label={site.brand.name}
        className="invisible fixed top-5 left-w z-40 lg:top-8"
      >
        <div className="flex-center size-12 rounded-full bg-black">
          <Logo variant="icon" tone="light" className="size-7" />
        </div>
      </TransitionLink>

      <nav ref={navRef} className="fixed top-6 right-w z-50 isolate lg:top-8" aria-label="Principal">
        <Reveal
          as="button"
          ref={toggleRef}
          effect="fade"
          delay={0.4}
          type="button"
          aria-expanded="false"
          aria-controls="site-menu"
          className={`style-caption flex items-center gap-3 rounded-lg px-2 pt-1.5 pb-1 transition-[gap] duration-300 lg:px-4 lg:py-2 lg:hover:gap-4 ${tone}`}
        >
          {site.ui.menu}
          <svg viewBox="0 0 16 12" className="h-3 w-4" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
            <line id="line-top" x1="2" y1="1.5" x2="14" y2="1.5" />
            <line id="line-mid-1" x1="2" y1="6" x2="14" y2="6" />
            <line id="line-mid-2" x1="2" y1="6" x2="14" y2="6" />
            <line id="line-bottom" x1="2" y1="10.5" x2="14" y2="10.5" />
          </svg>
        </Reveal>

        <div
          ref={wrapperRef}
          id="site-menu"
          style={{ display: "none" }}
          className="absolute -top-4 -right-2 -z-10 gap-4 overflow-clip rounded-md bg-black px-8 py-8 text-white"
        >
          <Logo variant="full" tone="light" className="h-6 w-auto" />
          <div className="flex w-full gap-8 max-md:flex-col md:min-w-[520px]">
            <div className="flex h-full flex-1 flex-col justify-between gap-3 max-md:order-last">
              <div className="grid gap-2">
                <div data-menu-info>
                  {[site.legal.company, site.legal.addressLine, site.legal.taxId].map((line) => (
                    <p key={line} className="relative overflow-hidden">
                      <span aria-hidden="true" className="invisible">
                        {line}
                      </span>
                      <span className="clone absolute inset-0">{line}</span>
                    </p>
                  ))}
                </div>
                <div data-menu-contact className="flex flex-col text-sm text-neutral-300">
                  <a className="w-fit transition-all duration-300 lg:hover:text-white" href={`mailto:${site.contact.email}`}>
                    {site.contact.email}
                  </a>
                  <a className="w-fit transition-all duration-300 lg:hover:text-white" href={site.contact.phoneHref}>
                    {site.contact.phoneLabel}
                  </a>
                </div>
              </div>
              <ul data-menu-social className="style-caption-xs flex items-center gap-2">
                {site.social.map((s) => (
                  <li key={s.label}>
                    <a aria-label={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="social-icon">
                      <SocialGlyph icon={s.icon} className="size-4" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div data-menu-separator className="h-[0.5px] w-full bg-neutral-500 md:h-auto md:w-[0.5px] md:self-stretch" />
            <div data-menu-nav className="min-w-48 max-md:order-first">
              <ul className="style-caption-xs nested-arrow-animations nested-underline grid gap-4">
                {site.nav.map((item) => (
                  <li key={item.href}>
                    <TransitionLink href={item.href} aria-current={pathname === item.href ? "page" : undefined}>
                      {item.label}
                    </TransitionLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
