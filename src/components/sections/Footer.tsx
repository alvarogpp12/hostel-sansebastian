"use client";

import { useState, type FormEvent } from "react";
import { Logo } from "@/components/brand/Logo";
import { Arrow, SocialGlyph } from "@/components/icons";
import { TransitionLink } from "@/components/TransitionLink";
import { site } from "@/content/site";

/**
 * Pie en un bloque negro, el mismo lenguaje que el bloque de reserva:
 * marca y «Reservar», navegación, contacto, boletín y textos legales.
 * Todo visible desde el principio (sin animaciones ligadas al scroll).
 */
export function Footer() {
  const [status, setStatus] = useState<{ state: "idle" | "sending" | "error"; message?: string }>({ state: "idle" });

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
  const caption = "style-caption-xs text-neutral-400";

  return (
    <footer className="p-w">
      <div className="grid gap-12 rounded-lg bg-black p-6 text-white sm:p-8 lg:gap-16 lg:p-12">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-w">
          <div className="grid content-start gap-5 lg:col-span-5">
            <Logo variant="full" tone="light" address className="h-20 w-auto lg:h-24" alt={`${site.brand.name}, ${site.legal.addressLine}`} />
            <p className="max-w-[40ch] text-neutral-300">{site.ui.footerIntro}</p>
            <TransitionLink href="/reservar" className="style-button min-h-12 !bg-offwhite !text-black">
              Reservar
              <Arrow />
            </TransitionLink>
          </div>

          <nav aria-label={site.ui.footerExplore} className="grid content-start gap-4 lg:col-span-3">
            <p className={caption}>{site.ui.footerExplore}</p>
            <ul className="grid gap-2">
              {site.footerNav.map((l) => (
                <li key={l.href}>
                  <TransitionLink href={l.href} className="text-neutral-200 transition-colors hover:text-white">
                    {l.label}
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="grid content-start gap-4 lg:col-span-4">
            <p className={caption}>{site.ui.footerContactTitle}</p>
            <p className="text-neutral-300">{site.ui.footerContactText}</p>
            <div className="grid">
              <a className="w-fit text-neutral-200 transition-colors hover:text-white" href={`mailto:${site.contact.email}`}>
                {site.contact.email}
              </a>
              {site.contact.phones.map((t) => (
                <a key={t.href} className="w-fit text-neutral-200 transition-colors hover:text-white" href={t.href}>
                  {t.label}
                </a>
              ))}
            </div>
            <p className="text-sm text-neutral-400">
              {site.legal.company}
              <br />
              {site.legal.taxId}
            </p>
            {site.social.length > 0 && (
              <ul className="flex items-center gap-2">
                {site.social.map((s) => (
                  <li key={s.label}>
                    <a aria-label={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="social-icon">
                      <SocialGlyph icon={s.icon} className="size-4" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Boletín (apagado mientras no haya proveedor: site.newsletter.enabled) */}
        {n.enabled && (
          <form onSubmit={onSubmit} className="grid gap-5 border-t border-neutral-800 pt-10 lg:grid-cols-12 lg:items-start lg:gap-w">
            <div className="grid gap-2 lg:col-span-5">
              <h2 className={caption}>{n.eyebrow}</h2>
              <p className="max-w-[44ch] text-neutral-300">{n.title}</p>
            </div>
            <div className="grid gap-3 lg:col-span-7">
              <div className="flex gap-2 max-sm:flex-col">
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
                  className="min-h-12 flex-1 rounded-full border border-neutral-700 bg-neutral-900 px-5 outline-none placeholder:text-neutral-500 focus:border-neutral-400"
                />
                <button
                  disabled={status.state === "sending"}
                  className="style-button min-h-12 justify-center !bg-white !text-black disabled:opacity-60 max-sm:!w-full"
                >
                  {n.submit}
                  <Arrow />
                </button>
              </div>
              <label htmlFor="newsletter-consent" className="flex items-start gap-2.5 text-xs text-neutral-300">
                <input
                  required
                  type="checkbox"
                  name="consent"
                  id="newsletter-consent"
                  className="mt-0.5 size-4 shrink-0 appearance-none rounded-sm border border-white checked:bg-white"
                />
                <span>
                  {n.consent}{" "}
                  <TransitionLink href={n.consentLink.href} className="underline">
                    {n.consentLink.label}
                  </TransitionLink>
                </span>
              </label>
              {status.message && (
                <p role="status" className={`text-sm ${status.state === "error" ? "text-red-400" : "text-neutral-200"}`}>
                  {status.message}
                </p>
              )}
            </div>
          </form>
        )}

        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-neutral-800 pt-6 text-xs text-neutral-400">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {site.legalLinks.list.map((l) => (
              <li key={l.href}>
                <TransitionLink href={l.href} className="transition-colors hover:text-white">
                  {l.label}
                </TransitionLink>
              </li>
            ))}
          </ul>
          <p>
            {site.legalLinks.rights}
            {site.credit && (
              <>
                {" · "}
                {site.credit.label}{" "}
                <a href={site.credit.href} target="_blank" rel="noopener noreferrer" className="underline">
                  {site.credit.name}
                </a>
              </>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
