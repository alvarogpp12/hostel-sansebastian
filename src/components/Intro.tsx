"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";

/**
 * Cortinilla de entrada: el logo animado, centrado, cubriendo la página
 * mientras el navegador termina de montarla (hidratación, fuentes e imagen
 * del hero). Cuando acaba la animación y la página está lista, se funde.
 *
 * Decisiones que evitan que una cortinilla se convierta en un problema:
 *
 *  - **Solo una vez por visita.** Se guarda una marca en sessionStorage, así
 *    que al navegar entre páginas o al volver atrás no se repite.
 *  - **Se puede saltar.** Clic, tecla o rueda del ratón la cierran al instante.
 *  - **Nunca deja la web bloqueada.** Se cierra sola con una animación CSS
 *    aunque el JavaScript falle, y hay un tope de 7 s por si la carga se
 *    atasca. El contenido se renderiza debajo desde el principio: los
 *    buscadores lo ven igual y la cortinilla no entra en el HTML inicial.
 *  - **Movimiento reducido.** Quien lo tenga activado ve el logo quieto y la
 *    cortinilla dura medio segundo.
 */

/** Duración de la animación del SVG, según las instrucciones de marca */
const ANIMATION_MS = 5050;
const FADE_MS = 450;
const MAX_MS = 7000;
const STORAGE_KEY = "ec-intro-visto";

export function Intro() {
  const [leaving, setLeaving] = useState(false);
  const [done, setDone] = useState(false);
  const closed = useRef(false);

  useEffect(() => {
    // Si ya se vio en esta visita, fuera al instante. El parpadeo lo evita el
    // script de `IntroFlashGuard`, que se ejecuta antes del primer pintado.
    let seen = false;
    try {
      seen = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      // Navegación privada o cookies bloqueadas: se muestra igual.
    }
    if (seen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDone(true);
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animation = reduced ? 500 : ANIMATION_MS;

    const close = () => {
      if (closed.current) return;
      closed.current = true;
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* da igual: como mucho se verá otra vez */
      }
      setLeaving(true);
      window.setTimeout(() => setDone(true), FADE_MS);
    };

    // Se cierra cuando la animación ha terminado Y la página está cargada,
    // que es lo que hace que el tiempo sirva para algo en vez de ser una espera.
    let ready = document.readyState === "complete";
    let animationDone = false;
    const maybeClose = () => ready && animationDone && close();

    const onLoad = () => {
      ready = true;
      maybeClose();
    };
    window.addEventListener("load", onLoad);

    const timers = [
      window.setTimeout(() => {
        animationDone = true;
        maybeClose();
      }, animation),
      // Tope de seguridad: pase lo que pase, la web se ve.
      window.setTimeout(close, MAX_MS),
    ];

    const skip = () => close();
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    window.addEventListener("wheel", skip, { passive: true });

    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("load", onLoad);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("wheel", skip);
      timers.forEach(window.clearTimeout);
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (done) document.body.style.overflow = "";
  }, [done]);

  if (done) return null;

  return (
    <div
      aria-hidden="true"
      data-intro
      data-leaving={leaving || undefined}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-beige"
    >
      <Logo variant="full" tone="dark" animated priority className="h-auto w-[min(72vw,340px)]" />
    </div>
  );
}
