import { home } from "@/content/home";
import { rooms } from "@/content/rooms";
import { site } from "@/content/site";

/**
 * Datos estructurados para buscadores (schema.org).
 *
 * Refuerzan el posicionamiento de "alojamiento céntrico en San Sebastián" sin añadir
 * texto visible. Los precios solo se publican cuando están confirmados
 * (`priceFrom !== null`): nunca se declara un precio inventado.
 */
function Json({ data }: { data: object }) {
  // Los datos salen de src/content (nunca de entrada de usuario), pero se
  // escapan "<" y "&" para que ningún texto pueda cerrar la etiqueta <script>.
  const json = JSON.stringify(data).replace(/</g, "\\u003c").replace(/&/g, "\\u0026");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

/**
 * Perfiles del alojamiento en otras webs. Le dicen a Google que todas esas
 * fichas son el mismo negocio y que esta es su web oficial.
 */
const SAME_AS = [
  "https://www.booking.com/hotel/es/enjoy-comfort.html",
  "https://www.tripadvisor.com/Hotel_Review-g187457-d6364304-Reviews-Enjoy_Comfort-Donostia_San_Sebastian_Province_of_Guipuzcoa_Basque_Country.html",
  "https://turismo.euskadi.eus/es/alojamientos/enjoy-comfort/aa30-12375/es",
  "https://sansebastianturismoa.eus/establecimientos/pension-enjoy-comfort/",
];

export function LocalBusinessSchema() {
  const prices = rooms.map((r) => r.priceFrom).filter((p): p is number => p !== null);

  return (
    <>
      {/* Nombre del sitio en los resultados de Google («Enjoy Comfort» en vez del dominio) */}
      <Json
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": `${site.url}/#website`,
          name: "Enjoy Comfort",
          alternateName: [site.brand.name, "Pensión Enjoy Comfort"],
          url: `${site.url}/`,
          inLanguage: "es",
        }}
      />
      <Json
        data={{
          "@context": "https://schema.org",
          // Pensión de una estrella: no es un hostel, así que va como alojamiento genérico
          "@type": "LodgingBusiness",
          "@id": `${site.url}/#alojamiento`,
          name: site.brand.name,
          alternateName: ["Enjoy Comfort", "Pensión Enjoy Comfort"],
          description: site.seo.description,
          url: `${site.url}/`,
          sameAs: SAME_AS,
          hasMap: site.contact.mapsUrl,
          checkinTime: "16:00",
          checkoutTime: "11:00",
          image: rooms[0].image.src,
          starRating: { "@type": "Rating", ratingValue: 1 },
          email: site.contact.email,
          telephone: site.contact.phoneHref.replace("tel:", ""),
          address: {
            "@type": "PostalAddress",
            streetAddress: site.legal.street,
            postalCode: site.legal.postalCode,
            addressLocality: site.legal.city,
            addressRegion: site.legal.region,
            addressCountry: "ES",
          },
          ...(prices.length
            ? { priceRange: "€", makesOffer: { "@type": "Offer", priceCurrency: "EUR", lowPrice: Math.min(...prices) } }
            : {}),
          amenityFeature: [
            { "@type": "LocationFeatureSpecification", name: "Habitación privada", value: true },
            { "@type": "LocationFeatureSpecification", name: "Habitaciones con baño privado", value: true },
            { "@type": "LocationFeatureSpecification", name: "Habitaciones con baño compartido", value: true },
            { "@type": "LocationFeatureSpecification", name: "Wifi", value: true },
          ],
        }}
      />
    </>
  );
}

export function FaqSchema() {
  return (
    <Json
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: home.faq.items.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }}
    />
  );
}
