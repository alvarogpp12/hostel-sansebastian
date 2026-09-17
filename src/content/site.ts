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

/** Dominio por defecto mientras no haya uno real. PENDIENTE: dominio del hostal */
const FALLBACK_URL = "https://www.enjoycomfortsansebastian.com";

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
   * relleno perjudica al hostal y tarda semanas en corregirse en Google.
   */
  indexable: process.env.SITE_INDEXABLE === "true",

  /** Production URL, used for canonical URLs, sitemap and structured data */
  url: resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),

  brand: {
    name: "Enjoy Comfort San Sebastián",
    description:
      "Tu hostal económico en San Sebastián. Habitaciones privadas individuales, dobles y triples con baño compartido.",
    wordmark: { upright: "ENJOY", italic: "Comfort" },
    slogan: "Descansa a gusto. Disfruta de Donosti.",
  },

  seo: {
    /** Main keyword target: "hostal barato San Sebastián" */
    title: "Hostal económico en San Sebastián | Enjoy Comfort",
    description:
      "Hostal económico en San Sebastián con habitaciones privadas individuales, dobles y triples y baños compartidos. Consulta disponibilidad para tus fechas.",
    keywords: [
      "hostal económico San Sebastián",
      "hostal barato San Sebastián",
      "habitación económica en San Sebastián",
      "alojamiento económico Donostia",
      "habitaciones privadas San Sebastián",
    ],
  },

  legal: {
    company: "Enjoy Comfort San Sebastián", // PENDIENTE: razón social
    street: "Dirección pendiente", // PENDIENTE
    postalCode: "20000", // PENDIENTE
    city: "Donostia-San Sebastián",
    region: "Gipuzkoa",
    taxId: "NIF: pendiente", // PENDIENTE
    /** One-line address used in header, footer and contact block */
    get addressLine() {
      return `${this.street}, ${this.postalCode} ${this.city}`;
    },
  },

  contact: {
    email: "reservas@enjoycomfortsansebastian.com", // PENDIENTE
    phoneLabel: "T: +34 000 000 000", // PENDIENTE
    phoneHref: "tel:+34000000000", // PENDIENTE
    mapQuery: "Donostia-San Sebastián", // PENDIENTE: dirección exacta para el mapa
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Donostia-San+Sebasti%C3%A1n",
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

  cta: {
    title: "Tu próxima escapada a Donosti empieza aquí",
    text: "Ya tienes el destino. Ahora encuentra la habitación para disfrutarlo. Dinos cuándo quieres venir y cuántas personas viajáis: te confirmaremos las opciones disponibles para tu estancia en San Sebastián.",
    button: { label: "Consultar disponibilidad", href: "/reservar" },
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
    quickNav: "Acceso rápido",
    openGallery: "Ver fotos",
    close: "Cerrar",
    book: "Consultar disponibilidad",
    perNight: "/noche",
    footerIntro: "Tu hostal económico en San Sebastián. Habitaciones privadas individuales, dobles y triples con baño compartido.",
    footerContactTitle: "¿Tienes alguna pregunta?",
    footerContactText: "Escríbenos y te ayudaremos a preparar tu estancia.",
    footerExplore: "Explora Enjoy Comfort",
    footerLegal: "Información legal",
  },
};
