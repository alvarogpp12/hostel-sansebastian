/**
 * Global brand, contact and SEO configuration.
 *
 * Anything marked PENDIENTE is a placeholder that must be replaced with the
 * client's real data before going live (see README → "Datos pendientes").
 */

export type IconName =
  | "sparkle"
  | "leaf"
  | "marker"
  | "tag"
  | "waves"
  | "globe"
  | "users"
  | "bed"
  | "euro"
  | "calendar"
  | "shower"
  | "wifi"
  | "sun"
  | "eye"
  | "clock"
  | "key"
  | "heart"
  | "shield"
  | "train"
  | "utensils"
  | "mountain"
  | "creditCard";

export type SocialLink = {
  label: string;
  href: string;
  icon: "facebook" | "instagram" | "linkedin";
};

export type NavLink = { label: string; href: string };

/** Dominio por defecto si NEXT_PUBLIC_SITE_URL no está definida */
const FALLBACK_URL = "https://enjoycomfort.com";

/**
 * Resuelve la URL pública de forma tolerante.
 *
 * La variable de entorno puede llegar vacía (creada en Vercel sin valor), con
 * espacios, o sin protocolo. Cualquiera de esas cosas rompía el build al
 * construir `new URL(...)`, así que aquí se normaliza y, si no hay manera, se
 * usa el dominio por defecto en vez de tumbar el despliegue.
 */
function resolveSiteUrl(value: string | undefined): string {
  const raw = value?.trim();
  if (!raw) return FALLBACK_URL;
  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(candidate).origin;
  } catch {
    return FALLBACK_URL;
  }
}

export const site = {
  /**
   * ¿Puede Google indexar la web?
   *
   * Por defecto NO. Se activa poniendo la variable de entorno
   * SITE_INDEXABLE=true en Vercel y volviendo a desplegar, cuando estén la
   * dirección, el teléfono, el NIF y los precios reales. Indexar datos de
   * relleno perjudica al alojamiento y tarda semanas en corregirse en Google.
   */
  indexable: process.env.SITE_INDEXABLE === "true",

  /**
   * Pantalla de "Próximamente".
   *
   * En producción (enjoycomfort.com) se ve SOLO esa pantalla hasta que se
   * ponga la variable de entorno SITE_LAUNCHED=true en Vercel y se vuelva a
   * desplegar. En local y en los despliegues de vista previa se ve la web
   * completa, para poder seguir trabajando en ella.
   */
  comingSoon: process.env.VERCEL_ENV === "production" && process.env.SITE_LAUNCHED !== "true",

  /** Production URL, used for canonical URLs, sitemap and structured data */
  url: resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),

  brand: {
    name: "Enjoy Comfort San Sebastián",
    description:
      "Tu alojamiento céntrico en San Sebastián. Habitaciones dobles, de dos camas y familiares, con baño compartido o privado.",
    wordmark: { upright: "ENJOY", italic: "Comfort" },
    slogan: "Céntrico, cómodo y tranquilo.",
  },

  seo: {
    /** Main keyword target: "alojamiento céntrico San Sebastián" */
    title: "Alojamiento céntrico en San Sebastián | Enjoy Comfort",
    description:
      "Alojamiento céntrico en San Sebastián, junto a la playa de Gros y a pocos minutos de la Parte Vieja. Habitaciones dobles, de dos camas y familiares con baño compartido o privado.",
    keywords: [
      "alojamiento céntrico San Sebastián",
      "pensión en San Sebastián",
      "alojamiento céntrico Donostia",
      "alojamiento cerca de la playa de Gros",
      "habitación familiar San Sebastián",
      "habitación doble San Sebastián",
    ],
  },

  legal: {
    company: "Enjoy Comfort San Sebastián", // PENDIENTE: razón social
    // Dirección de LOGOS.pdf
    street: "C/ Nueva 5 - 1ºB",
    postalCode: "20001",
    city: "Donostia-San Sebastián",
    region: "Gipuzkoa",
    taxId: "NIF: pendiente", // PENDIENTE
    /** One-line address used in header, footer and contact block */
    get addressLine() {
      return `${this.street}, ${this.postalCode} ${this.city}`;
    },
  },

  contact: {
    email: "reservas@enjoycomfort.com",
    /** Teléfono principal (fijo): el que va en los datos estructurados */
    phoneLabel: "T: +34 943 43 12 28",
    phoneHref: "tel:+34943431228",
    /** Todos los teléfonos que se enseñan en la web (cabecera, pie, reservas) */
    phones: [
      { label: "T: +34 943 43 12 28", href: "tel:+34943431228" },
      { label: "M: +34 699 90 14 51", href: "tel:+34699901451" },
    ],
    mapQuery: "Calle Nueva 5, 20001 Donostia-San Sebastián",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Calle+Nueva+5%2C+20001+Donostia-San+Sebasti%C3%A1n",
  },

  social: [
    { label: "Facebook", href: "https://www.facebook.com/", icon: "facebook" }, // PENDIENTE
    { label: "Instagram", href: "https://www.instagram.com/", icon: "instagram" }, // PENDIENTE
  ] satisfies SocialLink[],

  nav: [
    { label: "Habitaciones", href: "/habitaciones" },
    { label: "Por qué elegirnos", href: "/#por-que-elegirnos" },
    { label: "Ubicación", href: "/ubicacion" },
    { label: "Preguntas frecuentes", href: "/#preguntas-frecuentes" },
  ] satisfies NavLink[],

  footerNav: [
    { label: "Inicio", href: "/" },
    { label: "Habitaciones", href: "/habitaciones" },
    { label: "Ubicación y qué ver", href: "/ubicacion" },
    { label: "Información práctica", href: "/info-practica" },
    { label: "Consultar disponibilidad", href: "/reservar" },
  ] satisfies NavLink[],

  legalLinks: {
    rights: "© Enjoy Comfort. Todos los derechos reservados.",
    /** Bloque "Información legal" del pie */
    list: [
      { label: "Aviso legal", href: "/aviso-legal" },
      { label: "Política de privacidad", href: "/privacidad" },
      { label: "Política de cookies", href: "/cookies" },
      { label: "Términos y condiciones", href: "/terminos" },
    ] satisfies NavLink[],
    privacy: { label: "Política de privacidad", href: "/privacidad" },
    terms: { label: "Términos y condiciones", href: "/terminos" },
  },

  credit: null as { label: string; name: string; href: string } | null,

  /** Bloque de reserva negro al final de las páginas */
  cta: {
    title: "Tu próxima escapada a Donosti empieza aquí",
    text: "Pon tus fechas y mira al momento qué habitaciones quedan libres y a qué precio.",
  },

  newsletter: {
    eyebrow: "Recibe nuestras novedades y ofertas",
    title: "Déjanos tu correo electrónico si quieres recibir información sobre ofertas y próximas estancias en Enjoy Comfort.",
    placeholder: "Tu correo electrónico",
    consent: "Quiero recibir novedades y ofertas de Enjoy Comfort y he leído la",
    consentLink: { label: "Política de privacidad", href: "/privacidad" },
    submit: "Quiero recibir ofertas",
  },

  ui: {
    menu: "Menú",
    skipToContent: "Saltar al contenido",
    openGallery: "Ver fotos",
    close: "Cerrar",
    book: "Consultar disponibilidad",
    perNight: "/noche",
    footerIntro: "Tu alojamiento céntrico en San Sebastián. Habitaciones dobles, de dos camas y familiares, con baño compartido o privado.",
    footerContactTitle: "¿Tienes alguna pregunta?",
    footerContactText: "Escríbenos y te ayudaremos a preparar tu estancia.",
    footerExplore: "Explora Enjoy Comfort",
    footerLegal: "Información legal",
  },
};
