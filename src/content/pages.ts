import { media, type Media } from "./media";
import type { IconName } from "./site";

export type IconCard = { icon: IconName; title: string; text: string };
export type ImageCard = { icon: IconName; title: string; text: string; image: Media };

/* ------------------------------------------------------------------ */
/* Habitaciones                                                          */
/* ------------------------------------------------------------------ */
export const roomsPage = {
  title: "Habitaciones baratas en San Sebastián",
  intro:
    "Tres tipos de habitación privada, todas con baño compartido. Elige la que encaja con tu viaje, mira las fotos y reserva en un minuto.",
  quickNav: [
    { label: "Habitaciones", href: "#habitaciones" },
    { label: "Baños compartidos", href: "#banos" },
    { label: "Qué incluye", href: "#que-incluye" },
  ],
  bathrooms: {
    title: "Baños compartidos, siempre a punto",
    text: "Compartir baño es parte de lo que nos permite mantener precios bajos, pero no renunciamos a la limpieza: se revisan y limpian a diario.",
    image: media.bathrooms[1],
  },
  // VERIFICAR con el cliente
  included: {
    title: "Qué incluye",
    text: "Lo básico para descansar bien, sin extras que encarezcan la noche:",
    items: [
      { icon: "bed", title: "Ropa de cama", text: "Sábanas limpias en cada estancia." },
      { icon: "shower", title: "Baños compartidos", text: "Limpieza diaria." },
      { icon: "wifi", title: "Wifi", text: "Conexión en el alojamiento." },
      { icon: "key", title: "Habitación privada", text: "Solo para ti o tu grupo." },
    ] satisfies IconCard[],
  },
};

/* ------------------------------------------------------------------ */
/* Ubicación y qué ver                                                    */
/* ------------------------------------------------------------------ */
export const locationPage = {
  title: "Ubicación y qué ver en San Sebastián",
  intro:
    "Dormir barato en San Sebastián te deja presupuesto para lo importante: la ciudad. Estas son las visitas que recomendamos a nuestros huéspedes, casi todas gratis.",
  places: {
    title: "Qué ver sin gastar",
    text: "Planes para disfrutar Donosti a pie y con poco dinero.",
    items: [
      { icon: "waves", title: "Playa de La Concha", text: "El símbolo de la ciudad. Paseo, baño y atardecer sin coste.", image: media.city.bay },
      { icon: "eye", title: "Peine del Viento", text: "Al final de Ondarreta, las esculturas de Eduardo Chillida frente al mar.", image: media.city.comb },
      { icon: "mountain", title: "Vistas de la bahía", text: "Sube al monte Urgull andando para ver la ciudad desde arriba.", image: media.city.aerial },
      { icon: "utensils", title: "Ruta de pintxos", text: "Elige bien la barra y cenar en la Parte Vieja sale mucho más barato de lo que parece.", image: media.city.pintxos },
      { icon: "sun", title: "Olas en el paseo", text: "Los días de temporal, el mar rompe contra el paseo: un espectáculo gratis.", image: media.city.waves },
    ] satisfies ImageCard[],
  },
  mapTitle: "Cómo llegar",
  mapText: "Te enviamos la dirección exacta y las indicaciones al confirmar tu reserva.", // PENDIENTE: dirección pública
};

/* ------------------------------------------------------------------ */
/* Info práctica                                                          */
/* ------------------------------------------------------------------ */
export const practical = {
  title: "Información práctica",
  // PENDIENTE: todos los datos concretos deben confirmarse con el cliente
  cards: [
    {
      icon: "shower",
      title: "Habitaciones y baños",
      wide: true,
      body: [{ type: "p", text: "Todas las habitaciones son privadas (individual, doble o triple) y los baños son compartidos." }],
    },
    {
      icon: "clock",
      title: "Entrada y salida",
      body: [
        { type: "p", text: "Horario de check-in: pendiente de confirmar." },
        { type: "p", text: "Horario de check-out: pendiente de confirmar." },
      ],
    },
    {
      icon: "creditCard",
      title: "Pago y cancelación",
      body: [
        { type: "p", text: "Te indicamos las condiciones de pago y cancelación al confirmar la disponibilidad." },
        { type: "em", text: "Condiciones pendientes de confirmar por el alojamiento." },
      ],
    },
    {
      icon: "train",
      title: "Cómo llegar",
      body: [
        { type: "ul", items: ["Tren y autobús: estación de Donostia", "Aeropuerto de San Sebastián (Hondarribia)", "Aeropuerto de Bilbao con autobús directo"] },
        { type: "em", text: "Te mandamos indicaciones detalladas con la confirmación." },
      ],
    },
    {
      icon: "globe",
      title: "Idiomas",
      body: [{ type: "p", text: "Idiomas de atención: pendiente de confirmar." }],
    },
  ] as {
    icon: IconName;
    title: string;
    wide?: boolean;
    body: ({ type: "p"; text: string } | { type: "em"; text: string } | { type: "ul"; items: string[] })[];
  }[],
  services: {
    title: "Reserva en un minuto",
    text: "Elige el tipo de habitación, pon tus fechas y reserva al momento.",
    links: [
      { label: "Individual", href: "/reservar?habitacion=individual" },
      { label: "Doble / Dos camas", href: "/reservar?habitacion=doble" },
      { label: "Triple", href: "/reservar?habitacion=triple" },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Reservar                                                                */
/* ------------------------------------------------------------------ */
export const bookingPage = {
  title: "Reservar",
  formTitle: "Reserva tu habitación",
  formIntro: "Elige habitación, fechas y personas, deja tus datos y paga la señal. Recibirás la confirmación por email al instante.",
  fields: {
    room: "Habitación",
    checkIn: "Entrada",
    checkOut: "Salida",
    guests: "Personas",
    holder: "Datos de la reserva",
    firstname: "Nombre",
    lastname: "Apellidos",
    email: "Email",
    telephone: "Teléfono",
  },
  nights: (n: number) => (n === 1 ? "1 noche" : `${n} noches`),
  submit: "Pagar y reservar",
  sending: "Conectando con el pago…",
  /** Nota bajo el resumen de precio */
  priceNotice:
    "Se paga ahora una señal y el resto en el hostal. El precio final, con impuestos, se confirma antes de pagar.",
  /** Aviso bajo el botón: explica que el pago ocurre en el motor de reservas */
  engineNotice:
    "Al continuar se comprueba la disponibilidad y se realiza el pago de forma segura. Al reservar aceptas las",
  /** Se muestra mientras el motor de reservas no está configurado */
  notConfigured:
    "La reserva online estará disponible en cuanto activemos el sistema de reservas. Mientras tanto, escríbenos o llámanos y te confirmamos disponibilidad:",
  mapLink: "Ver en Google Maps",
};

export const legal = {
  notice: {
    title: "Aviso legal",
    body: "Texto legal pendiente. Sustituye este contenido por el aviso legal del alojamiento: titular del sitio, datos identificativos, objeto, condiciones de uso y propiedad intelectual.",
  },
  cookies: {
    title: "Política de cookies",
    body: "Texto legal pendiente. Sustituye este contenido por la política de cookies: qué cookies se usan, con qué finalidad, su duración y cómo configurarlas o rechazarlas.",
  },
  privacy: {
    title: "Política de privacidad",
    body: "Texto legal pendiente. Sustituye este contenido por la política de privacidad del alojamiento (responsable del tratamiento, finalidad, legitimación, destinatarios y derechos RGPD).",
  },
  terms: {
    title: "Términos y condiciones",
    body: "Texto legal pendiente. Sustituye este contenido por las condiciones de reserva, pago, cancelación y normas de la casa.",
  },
};
