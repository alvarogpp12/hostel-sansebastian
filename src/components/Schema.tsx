import { home } from "@/content/home";
import { rooms } from "@/content/rooms";
import { site } from "@/content/site";

/**
 * Datos estructurados para buscadores (schema.org).
 *
 * Refuerzan el posicionamiento de "hostal barato en San Sebastián" sin añadir
 * texto visible. Los precios solo se publican cuando están confirmados
 * (`priceFrom !== null`): nunca se declara un precio inventado.
 */
function Json({ data }: { data: object }) {
  // Los datos salen de src/content (nunca de entrada de usuario), pero se
  // escapan "<" y "&" para que ningún texto pueda cerrar la etiqueta <script>.
  const json = JSON.stringify(data).replace(/</g, "\\u003c").replace(/&/g, "\\u0026");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

export function LocalBusinessSchema() {
  const prices = rooms.map((r) => r.priceFrom).filter((p): p is number => p !== null);

  return (
    <Json
      data={{
        "@context": "https://schema.org",
        "@type": "Hostel",
        name: site.brand.name,
        description: site.seo.description,
        url: site.url,
        image: `${site.url}/media/habitacion-doble-1.jpg`,
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
          { "@type": "LocationFeatureSpecification", name: "Baño compartido", value: true },
          { "@type": "LocationFeatureSpecification", name: "Wifi", value: true },
        ],
      }}
    />
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
