"use client";

import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";
import { gsap } from "@/lib/gsap";
import { useLenis } from "./providers/SmoothScroll";

type Props = ComponentProps<typeof NextLink> & { href: string };

/**
 * Internal link with the reference's page transition: the current view fades
 * out (0.3s) before navigating; `app/template.tsx` fades the next view in.
 * Same-page hash links scroll smoothly with Lenis instead.
 */
export function TransitionLink({ href, onClick, ...rest }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

    if (href.startsWith("#")) {
      const target = document.querySelector<HTMLElement>(href);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -40, duration: 1 });
      else target.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin || url.pathname === pathname) return;

    e.preventDefault();
    const view = document.querySelector("[data-page-view]");
    gsap.to(view, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => router.push(href),
    });
  };

  return <NextLink href={href} onClick={handleClick} {...rest} />;
}
