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
   * URLs de la web antigua (buuteeq: /es-es, /en-us, /de-de/rooms/…), que
   * Google aún tiene guardadas. Redirección permanente a la página equivalente
   * en el idioma más cercano, para que no den 404 y su posicionamiento pase a
   * la web nueva.
   */
  async redirects() {
    // Español (y euskera/catalán) → web en español; francés → /fr; inglés y el
    // resto de idiomas de la web antigua (alemán, italiano, sueco, turco…) → /en.
    const es = ":lang(es-es|es-ES|eu-es|eu-ES|ca-es|ca-ES)";
    const fr = ":lang(fr-fr|fr-FR|fr-be|fr-BE|fr-ch|fr-CH)";
    const other =
      ":lang(en-us|en-US|en-gb|en-GB|de-de|de-DE|it-it|it-IT|pt-pt|pt-PT|nl-nl|nl-NL|sv-se|sv-SE|tr-tr|tr-TR|da-dk|da-DK|nb-no|nb-NO|fi-fi|fi-FI|pl-pl|pl-PL|ru-ru|ru-RU|ja-jp|ja-JP|zh-cn|zh-CN)";
    const map = (lang: string, base: string, rooms: string, location: string, book: string) => [
      { source: `/${lang}/:path(rooms|habitaciones|alojamiento|accommodation)/:rest*`, destination: rooms, permanent: true },
      { source: `/${lang}/:path(location|ubicacion|localizacion|como-llegar|contact|contacto)`, destination: location, permanent: true },
      { source: `/${lang}/:path(booking|reservas|reservar|book)`, destination: book, permanent: true },
      { source: `/${lang}/:path*`, destination: base, permanent: true },
    ];
    return [
      ...map(es, "/", "/habitaciones", "/ubicacion", "/reservar"),
      ...map(fr, "/fr", "/fr/chambres", "/fr/emplacement", "/fr/reserver"),
      ...map(other, "/en", "/en/rooms", "/en/location", "/en/book"),
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
