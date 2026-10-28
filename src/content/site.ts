/**
 * Global brand, contact and SEO configuration.
 *
 * Anything marked PENDIENTE is a placeholder that must be replaced with the
 * client's real data before going live (see README → "Datos").
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
   * ¿Puede Google indexar la web? Sí en producción (enjoycomfort.com); no en
   * local ni en las vistas previas de Vercel, para que Google no recoja
   * copias de la web en otras URLs. SITE_INDEXABLE=false lo apaga en
   * producción si alguna vez hace falta.
   */
  indexable: process.env.VERCEL_ENV === "production" && process.env.SITE_INDEXABLE !== "false",

  /**
   * Pantalla de "Próximamente". La web está abierta: solo se vuelve a ver esa
   * pantalla en producción si se pone SITE_LAUNCHED=false en Vercel.
   */
  comingSoon: process.env.VERCEL_ENV === "production" && process.env.SITE_LAUNCHED === "false",

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
    /**
     * La marca va delante: quien busca «Enjoy Comfort» tiene que ver la web
     * oficial antes que Booking y los agregadores. Después, la palabra clave
     * «alojamiento céntrico San Sebastián».
     */
    title: "Enjoy Comfort San Sebastián · Web oficial | Pensión céntrica en Donostia",
    description:
      "Web oficial de Enjoy Comfort, pensión en Calle Nueva 5 (Gros), en el centro de San Sebastián, junto a la playa de Gros y a pocos minutos de la Parte Vieja. Reserva directa, sin comisiones.",
    keywords: [
      "alojamiento céntrico San Sebastián",
      "Enjoy Comfort San Sebastián",
      "Pensión Enjoy Comfort",
      "pensión en San Sebastián",
      "alojamiento céntrico Donostia",
      "alojamiento cerca de la playa de Gros",
      "habitación familiar San Sebastián",
      "habitación doble San Sebastián",
    ],
  },

  legal: {
    /** Nombre comercial del establecimiento */
    company: "Enjoy Comfort San Sebastián",
    /**
     * PENDIENTE: titular (nombre y apellidos o razón social) y su NIF. Salen en
     * el aviso legal, la privacidad y los términos; mientras sean null, esos
     * textos nombran el establecimiento.
     */
    owner: null as string | null,
    nif: null as string | null,
    /** Nº de registro turístico de Euskadi */
    license: "HSS00744",
    // Dirección de LOGOS.pdf
    street: "C/ Nueva 5 - 1ºB",
    postalCode: "20001",
    city: "Donostia-San Sebastián",
    region: "Gipuzkoa",
    /** Nº de registro turístico de Euskadi (se muestra en el pie y el menú) */
    taxId: "Nº de licencia: HSS00744",
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
    /** Botón flotante de WhatsApp (móvil) */
    whatsapp: {
      /** Número en formato internacional sin "+" (para wa.me) */
      number: "34699901451",
      href: `https://wa.me/34699901451?text=${encodeURIComponent("Hola, quería información sobre una estancia en Enjoy Comfort.")}`,
      label: "Escríbenos por WhatsApp",
    },
    mapQuery: "Calle Nueva 5, 20001 Donostia-San Sebastián",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Calle+Nueva+5%2C+20001+Donostia-San+Sebasti%C3%A1n",
  },

  /**
   * Perfiles de redes sociales. Vacío hasta tener los enlaces reales (los
   * iconos no se pintan si no hay ninguno). Ejemplo:
   *   { label: "Instagram", href: "https://www.instagram.com/usuario/", icon: "instagram" },
   */
  social: [] as SocialLink[],

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
    /** Apagado hasta conectar un proveedor (ver README → Newsletter) */
    enabled: false,
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
