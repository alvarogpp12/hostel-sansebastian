import type { NextConfig } from "next";

/**
 * Cabeceras de seguridad para todas las rutas. No se pone una CSP completa
 * (scripts inline del layout, JSON-LD, Stripe, Redforts, Google Maps…): solo
 * las directivas que no pueden romper nada y cierran lo importante, como que
 * otra web meta la nuestra en un iframe (clickjacking).
 */
const securityHeaders = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self \"https://checkout.stripe.com\")" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
