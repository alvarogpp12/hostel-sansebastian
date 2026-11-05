"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useConsent } from "@/lib/consent";
import { tracking } from "@/lib/tracking";

/**
 * Carga GA4 y el píxel de Meta SOLO si se han aceptado «Analítica y
 * publicidad» en el aviso de cookies. Sin ese permiso no se pide ningún script
 * a Google ni a Meta. Si se retira después, se les avisa (consent denied /
 * revoke) y dejan de medir.
 */
export function Tracking() {
  const consent = useConsent();
  const allowed = consent?.medicion === true;
  const pathname = usePathname();
  const firstPath = useRef(true);

  // Retirar el permiso sin recargar: Google y Meta dejan de usar cookies
  useEffect(() => {
    if (allowed) return;
    try {
      window.gtag?.("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
      window.fbq?.("consent", "revoke");
    } catch {
      // nada
    }
  }, [allowed]);

  // Páginas vistas de Meta en la navegación interna (GA4 ya las cuenta solo
  // con la medición mejorada de «cambios del historial»)
  useEffect(() => {
    if (!allowed) return;
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    try {
      window.fbq?.("track", "PageView");
    } catch {
      // nada
    }
  }, [pathname, allowed]);

  if (!allowed) return null;

  const { ga4Id, metaPixelId } = tracking;

  return (
    <>
      {ga4Id && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;
gtag('consent','default',{analytics_storage:'granted',ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted'});
gtag('js',new Date());gtag('config','${ga4Id}');`}
          </Script>
        </>
      )}
      {metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('consent','grant');fbq('init','${metaPixelId}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}
