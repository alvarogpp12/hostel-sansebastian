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
  images: {
    // Fotos de las habitaciones y de la ciudad en Vercel Blob (store público enjoycomfort-media)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "0qeiuusypiirkq70.public.blob.vercel-storage.com",
        port: "",
        pathname: "/habitaciones/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "0qeiuusypiirkq70.public.blob.vercel-storage.com",
        port: "",
        pathname: "/ciudad/**",
        search: "",
      },
    ],
  },
  /**
   * URLs de la web antigua (buuteeq: /es-es, /en-us, /es-es/habitaciones…), que
   * Google aún tiene guardadas. Redirección permanente para que no den 404 y
   * su posicionamiento pase a la web nueva.
   */
  async redirects() {
    const old = ":lang(es-es|es-ES|en-us|en-US|en-gb|en-GB|fr-fr|fr-FR|de-de|de-DE|it-it|it-IT|pt-pt|pt-PT|eu-es|eu-ES|ca-es|ca-ES|nl-nl|nl-NL)";
    return [
      { source: `/${old}/:path(rooms|habitaciones|alojamiento|accommodation)`, destination: "/habitaciones", permanent: true },
      { source: `/${old}/:path(location|ubicacion|localizacion|como-llegar|contact|contacto)`, destination: "/ubicacion", permanent: true },
      { source: `/${old}/:path(booking|reservas|reservar|book)`, destination: "/reservar", permanent: true },
      { source: `/${old}/:path*`, destination: "/", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
