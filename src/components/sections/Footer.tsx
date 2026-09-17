"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Arrow, SocialGlyph } from "@/components/icons";
import { Reveal } from "@/components/Reveal";
import { TransitionLink } from "@/components/TransitionLink";
import { site } from "@/content/site";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const [status, setStatus] = useState<{ state: "idle" | "sending" | "error"; message?: string }>({ state: "idle" });

  /* Desktop: footer pieces assemble as you scroll to the end (scrubbed) */
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const [email, consent, endLeft, endRight, menuLeft, menuRight, separator] = [
        "[data-footer-email]",
        "[data-footer-consent]",
        "[data-footer-end-left]",
        "[data-footer-end-right]",
        "[data-footer-menu-left]",
        "[data-footer-menu-right]",
        "[data-footer-separator]",
      ].map((s) => q(s)[0]);
      // Algunos bloques son opcionales (por ejemplo el crédito de agencia),
      // así que solo se anima lo que de verdad está en la página.
      const tl = gsap.timeline({ paused: true });
      if (email) tl.fromTo(email, { opacity: 0, width: "240px" }, { opacity: 1, duration: 3, width: "100%" });
      if (consent) tl.to(consent, { opacity: 1, duration: 1 }, "-=1");
      if (menuLeft) tl.to(menuLeft, { opacity: 1, duration: 1.5 }, "-=0.5");
      if (separator) tl.fromTo(separator, { height: 0 }, { opacity: 1, duration: 1.5, height: "100%" }, "<");
      if (menuRight) tl.to(menuRight, { opacity: 1, duration: 1.5 }, "<0.5");
      if (endLeft) tl.to(endLeft, { opacity: 1, duration: 1 });
      if (endRight) tl.to(endRight, { opacity: 1, duration: 1 });
      const st = ScrollTrigger.create({ animation: tl, trigger: root, start: "60% 100%", end: "max", scrub: 2 });
      return () => {
        st.kill();
        tl.kill();
        gsap.set([email, consent, endLeft, endRight, menuLeft, menuRight, separator].filter(Boolean), { clearProps: "all" });
      };
    });
    return () => mm.revert();
  }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setStatus({ state: "sending" });
    try {
      const res = await fetch("/api/newsletter", { method: "POST", body: data });
      const json = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) throw new Error(json.message ?? "No se pudo completar la suscripción.");
      e.currentTarget?.reset();
      setStatus({ state: "idle", message: json.message });
    } catch (err) {
      setStatus({ state: "error", message: (err as Error).message });
    }
  };

  const n = site.newsletter;

  return (
    <footer ref={ref} className="p-w">
      <div className="grid gap-24 rounded-lg bg-neutral-900 p-6 text-white lg:p-w">
        <div className="grid gap-12 pt-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <Reveal as="h2" effect="delayedFade" className="style-caption">
              {n.eyebrow}
            </Reveal>
            <Reveal as="p" effect="delayedSplit" className="style-heading text-xl lg:max-w-[32ch] lg:text-3xl">
              {n.title}
            </Reveal>
          </div>

          <form onSubmit={onSubmit} noValidate={false}>
            <div className="flex w-full flex-col items-center gap-3">
              <div data-footer-email className="group relative mx-auto w-full lg:max-w-2xl">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email
                </label>
                <input
                  type="email"
                  id="newsletter-email"
                  name="email"
                  autoComplete="email"
                  placeholder={n.placeholder}
                  required
                  className="w-full rounded-3xl border border-neutral-800 bg-neutral-800 px-6 py-3 pr-16 transition-all duration-500 outline-none placeholder:text-neutral-500 group-hover:border-neutral-700 focus:bg-neutral-700"
                />
                <button
                  disabled={status.state === "sending"}
                  className="style-button absolute top-1/2 right-0 -translate-y-1/2 bg-white px-6 py-3 text-black max-sm:static max-sm:mt-3 max-sm:w-full max-sm:translate-y-0 max-sm:justify-center"
                >
                  {n.submit}
                  <Arrow />
                </button>
              </div>
              <label data-footer-consent htmlFor="newsletter-consent" className="flex items-center gap-2.5 text-xs">
                <input
                  required
                  type="checkbox"
                  name="consent"
                  id="newsletter-consent"
                  className="size-4 appearance-none rounded-sm border border-white checked:bg-white"
                />
                <span>
                  {n.consent}{" "}
                  <TransitionLink href={n.consentLink.href} className="underline">
                    {n.consentLink.label}
                  </TransitionLink>
                </span>
              </label>
              {status.message && (
                <p
                  role="status"
                  className={`mt-2 max-w-xl p-4 text-center text-sm ${status.state === "error" ? "border border-red-400" : ""}`}
                >
                  {status.message}
                </p>
              )}
            </div>
          </form>
        </div>

        <div className="mx-auto flex w-full gap-w max-lg:flex-col lg:max-w-2xl">
          <div data-footer-menu-left className="flex h-full flex-col justify-between gap-12 lg:gap-4 lg:pl-w">
            <hr className="m-0 h-[0.5px] w-full border-0 bg-neutral-800 p-0 lg:hidden" />
            <div className="grid gap-4">
              <p className="max-w-[42ch]">{site.ui.footerIntro}</p>
              <div className="grid gap-1">
                <p className="style-caption-xs">{site.ui.footerContactTitle}</p>
                <p className="text-neutral-300">{site.ui.footerContactText}</p>
              </div>
              <p className="text-sm text-neutral-400">
                {site.legal.company}
                <br />
                {site.legal.addressLine}
                <br />
                {site.legal.taxId}
              </p>
              <div className="grid text-neutral-300">
                <a className="w-fit transition-all duration-300 lg:hover:text-white" href={`mailto:${site.contact.email}`}>
                  {site.contact.email}
                </a>
                <a className="w-fit transition-all duration-300 lg:hover:text-white" href={site.contact.phoneHref}>
                  {site.contact.phoneLabel}
                </a>
              </div>
            </div>
            <Reveal as="ul" effect="fade" delay={0.4} className="style-caption-xs flex items-center gap-2">
              {site.social.map((s) => (
                <li key={s.label}>
                  <a aria-label={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="social-icon">
                    <SocialGlyph icon={s.icon} className="size-4" />
                  </a>
                </li>
              ))}
            </Reveal>
            <hr className="m-0 h-[0.5px] w-full border-0 bg-neutral-800 p-0 lg:hidden" />
          </div>
          <hr data-footer-separator className="m-0 h-full w-[0.5px] border-0 bg-neutral-600 p-0 max-lg:hidden" />
          <div data-footer-menu-right className="grid gap-3">
            <p className="style-caption-xs text-neutral-400">{site.ui.footerExplore}</p>
            <ul className="style-caption-xs nested-underline nested-arrow-animations grid gap-3">
              {site.footerNav.map((l) => (
                <li key={l.href}>
                  <TransitionLink href={l.href}>{l.label}</TransitionLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="style-caption-xs flex gap-8 max-lg:flex-col lg:items-end lg:justify-between">
          <div data-footer-end-left className="grid gap-3">
            <p className="text-neutral-400">{site.ui.footerLegal}</p>
            <ul className="nested-underline flex flex-wrap items-center gap-x-4 gap-y-2">
              {site.legalLinks.list.map((l) => (
                <li key={l.href}>
                  <TransitionLink href={l.href} className="text-neutral-400">
                    {l.label}
                  </TransitionLink>
                </li>
              ))}
            </ul>
            <div>{site.legalLinks.rights}</div>
          </div>
          {site.credit && (
            <div data-footer-end-right className="flex gap-2 max-lg:ml-auto lg:items-center">
              <div>{site.credit.label}</div>
              <div>·</div>
              <a href={site.credit.href} target="_blank" rel="noopener noreferrer" className="text-neutral-400 underline">
                {site.credit.name}
              </a>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
