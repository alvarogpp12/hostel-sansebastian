import { media, type Media } from "./media";
import type { IconName } from "./site";

export type IconCard = { icon: IconName; title: string; text: string };
export type ImageCard = { icon: IconName; title: string; text: string; image: Media };

/* ------------------------------------------------------------------ */
/* Habitaciones                                                          */
/* ------------------------------------------------------------------ */
export const roomsPage = {
  title: "Habitaciones en el centro de San Sebastián",
  intro:
    "Cuatro tipos de habitación privada, con baño compartido o privado. Elige la que encaja con tu viaje, mira las fotos y reserva en un minuto.",
  quickNav: [
    { label: "Habitaciones", href: "#habitaciones" },
    { label: "Baños", href: "#banos" },
    { label: "Qué incluye", href: "#que-incluye" },
  ],
  bathrooms: {
    title: "Baños siempre a punto",
    text: "La doble y la de dos camas comparten baño; la doble con baño privado y la familiar tienen el suyo propio. Sean compartidos o privados, todos se revisan y limpian a diario.",
    image: media.bathrooms[1],
  },
  // VERIFICAR con el cliente
  included: {
    title: "Qué incluye",
    text: "Todo lo necesario para descansar bien:",
    items: [
      { icon: "bed", title: "Ropa de cama", text: "Sábanas limpias en cada estancia." },
      { icon: "shower", title: "Baño compartido o privado", text: "Según la habitación, con limpieza diaria." },
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
  intro: [
    "Desde Enjoy Comfort llegarás en un plis plas a la playa de Gros para pegarte un chapuzón junto al Kursaal o surfearte unas olitas tan a gusto. Y después, darte un homenaje en algunos de los bares y tabernas de la zona para que descubras los encantos que te ofrece un barrio que te atrapará.",
    "Llegar a la Parte Vieja o al centro te llevará menos de lo que canta un gallo y, para cuando llegues, lamentarás que no haya durado más el paseíto.",
  ],
  places: {
    title: "Qué ver cerca",
    text: "Planes para disfrutar Donosti a pie desde el alojamiento.",
    items: [
      { icon: "waves", title: "Playa de La Concha", text: "El símbolo de la ciudad. Paseo, baño y atardecer frente a la isla.", image: media.city.bay },
      { icon: "eye", title: "Peine del Viento", text: "Al final de Ondarreta, las esculturas de Eduardo Chillida frente al mar.", image: media.city.comb },
      { icon: "mountain", title: "Vistas de la bahía", text: "Sube al monte Urgull andando para ver la ciudad desde arriba.", image: media.city.aerial },
      { icon: "utensils", title: "Ruta de pintxos", text: "De barra en barra por la Parte Vieja y por las tabernas del barrio.", image: media.city.pintxos },
      { icon: "sun", title: "Olas en el paseo", text: "Los días de temporal, el mar rompe contra el paseo: todo un espectáculo.", image: media.city.waves },
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
      body: [{ type: "p", text: "Todas las habitaciones son privadas. La doble y la de dos camas tienen baño compartido; la doble con baño privado tiene un baño exclusivo fuera de la habitación, y la familiar, baño privado." }],
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
      { label: "Doble", href: "/reservar?habitacion=doble" },
      { label: "Dos camas", href: "/reservar?habitacion=dos-camas" },
      { label: "Doble con baño privado", href: "/reservar?habitacion=doble-privado" },
      { label: "Familiar", href: "/reservar?habitacion=familiar" },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Reservar                                                                */
/* ------------------------------------------------------------------ */
export const bookingPage = {
  title: "Reservar",
  formTitle: "Reserva tu habitación",
  formIntro:
    "Elige habitación y fechas y consulta al momento la disponibilidad y el precio. La reserva se confirma en el acto, sin intermediarios ni comisiones.",
  fields: {
    room: "Habitación",
    checkIn: "Entrada",
    checkOut: "Salida",
  },
  nights: (n: number) => (n === 1 ? "1 noche" : `${n} noches`),
  submit: "Ver disponibilidad y precio",
  /** Aviso bajo el botón: explica que la reserva y el pago ocurren en el motor */
  engineNotice:
    "Te mostramos la disponibilidad real para tus fechas. Los datos y el pago se completan de forma segura en nuestro sistema de reservas. Al reservar aceptas las",
  engineTitle: "Sistema de reservas de Enjoy Comfort",
  engineFallback: "¿No se carga el sistema de reservas?",
  engineFallbackLink: "Ábrelo en una pestaña nueva",
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
