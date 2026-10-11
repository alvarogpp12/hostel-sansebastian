"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Vuelve a pedir la página cada `seconds` mientras la reserva se está confirmando */
export function AutoRefresh({ seconds = 3, maxTries = 40 }: { seconds?: number; maxTries?: number }) {
  const router = useRouter();
  useEffect(() => {
    let tries = 0;
    const id = window.setInterval(() => {
      tries += 1;
      if (tries > maxTries) window.clearInterval(id);
      else router.refresh();
    }, seconds * 1000);
    return () => window.clearInterval(id);
  }, [router, seconds, maxTries]);
  return null;
}
