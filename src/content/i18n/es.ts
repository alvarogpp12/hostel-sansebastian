import { home } from "../home";
import { locationPage, practical, roomsPage } from "../pages";
import { rooms } from "../rooms";
import { site, type NavLink } from "../site";

/**
 * Textos en español: el original. Los diccionarios en inglés y francés
 * (en.ts, fr.ts) tienen exactamente la misma forma (`Dict`).
 */
export const es = {
  site: {
    description: site.brand.description,
    slogan: site.brand.slogan,
    seo: { title: site.seo.title, description: site.seo.description },
    nav: site.nav as NavLink[],
    footerNav: site.footerNav as NavLink[],
    legal: {
      list: site.legalLinks.list as NavLink[],
      privacy: site.legalLinks.privacy,
      terms: site.legalLinks.terms,
      rights: site.legalLinks.rights,
      cookieSettings: "Configurar cookies",
    },
    cta: site.cta,
    ui: {
      ...site.ui,
      book: "Reservar",
      bookThis: "Reservar esta",
      directBooking: "Reserva directa",
      seeDetails: "Ver fotos y detalles",
      finalPrice: "Precio final al elegir fechas",
      consultPrice: "Consultar precio",
      from: "desde",
      locationLink: "Ubicación y qué ver",
      practicalLink: "Información práctica",
      onThisPage: "En esta página",
      mapOf: "Mapa de",
      language: "Idioma",
      main: "Principal",
      roomsAria: "Habitaciones",
    },
    whatsapp: { label: site.contact.whatsapp.label, text: "Hola, quería información sobre una estancia en Enjoy Comfort." },
  },

  home,
  roomsPage,
  locationPage,
  practical,

  book: {
    eyebrow: "Reserva directa",
    title: "Reserva tu habitación",
    intro: "Elige fechas y consulta al momento la disponibilidad y el precio de cada habitación. Reserva directa, sin intermediarios ni comisiones.",
    notConfigured:
      "La reserva online estará disponible en cuanto activemos el sistema de reservas. Mientras tanto, escríbenos o llámanos y te confirmamos disponibilidad:",
  },

  meta: {
    rooms: {
      title: "Habitaciones en el centro de San Sebastián",
      description:
        "Habitaciones dobles, de dos camas y familiares en el centro de San Sebastián, con baño compartido o privado. Reserva directa sin comisiones.",
    },
    location: {
      title: "Ubicación y qué ver en San Sebastián",
      description:
        "Un alojamiento céntrico junto a la playa de Gros y a un paseo de la Parte Vieja. Qué ver cerca: La Concha, el Peine del Viento, el monte Urgull y rutas de pintxos.",
    },
    practical: {
      title: "Información práctica",
      description:
        "Antes de llegar a Enjoy Comfort: horarios de entrada (16:00–22:00) y salida (11:00), habitaciones y baños, pago, cancelación y cómo llegar a Gros, en San Sebastián.",
    },
    book: {
      title: "Reservar habitación en San Sebastián",
      description:
        "Reserva online en nuestro alojamiento céntrico de San Sebastián: elige habitación y fechas, consulta la disponibilidad y el precio reales y reserva con pago seguro. Reserva directa sin comisiones.",
    },
  },

  rooms: Object.fromEntries(
    rooms.map((r) => [r.id, { name: r.name, short: r.short, meta: r.meta, cardText: r.cardText, text: r.text, specs: r.specs.map((s) => s.text) }]),
  ) as Record<(typeof rooms)[number]["id"], { name: string; short: string; meta: string; cardText: string; text: string; specs: string[] }>,

  search: {
    aria: "Buscar disponibilidad",
    arrival: "Llegada",
    departure: "Salida",
    people: "Personas",
    pick: "Elegir",
    submit: "Ver habitaciones libres",
    dialog: "Elige tus fechas",
    close: "Cerrar",
    done: "Listo",
    pickBoth: "Elige llegada y salida",
    adults: (n: number) => (n === 1 ? "1 adulto" : `${n} adultos`),
    nights: (n: number) => (n === 1 ? "1 noche" : `${n} noches`),
  },

  calendar: {
    prev: "Mes anterior",
    next: "Mes siguiente",
    loading: "Cargando disponibilidad…",
    pickArrival: "Elige el día de llegada.",
    pickDeparture: "Elige el día de salida.",
    changeArrival: "Toca otro día para cambiar la llegada.",
    error: "No se pudo cargar el calendario.",
  },

  steps: { labels: ["Fechas", "Habitación", "Tus datos y pago"], whatsappLast: "Tus datos y solicitud", aria: "Pasos de la reserva" },

  booking: {
    fields: {
      firstnames: "Nombre",
      middlenames: "Segundo nombre",
      surname: "Apellido",
      surname2: "Segundo apellido",
      address: "Dirección",
      postalcode: "Código postal",
      town: "Población",
      state: "Provincia",
      country: "País",
      email: "Email",
      phone: "Teléfono",
      phone2: "Otro teléfono",
      arrival_time: "Hora estimada de llegada",
      departure_time: "Hora estimada de salida",
    } as Record<string, string>,
    optional: "(opcional)",
    children: (n: number) => (n === 1 ? "1 niño" : `${n} niños`),
    and: "y",
    freeCancel: "Cancelación gratis hasta 7 días antes de la llegada",
    noCancel: "Sin cancelación",
    youSave: "ahorras",
    upTo: (n: number) => `Hasta ${n} ${n === 1 ? "persona" : "personas"}`,
    left: (n: number) => (n === 1 ? "queda 1" : `quedan ${n}`),
    total: (nights: number, perNight: string) => (nights === 1 ? "total · 1 noche" : `total · ${nights} noches (${perNight}/noche)`),
    quantityOf: "Cantidad de",
    choose: "Elegir",
    chosen: "Elegida",
    yourChoice: "Tu elección",
    change: "Cambiar",
    searching: "Buscando habitaciones libres…",
    autoUpdate: "Cambia las fechas o las personas y los precios se actualizan solos.",
    adultsLabel: "Adultos",
    childrenLabel: "Niños",
    promo: "Código promocional",
    promoAsk: "¿Tienes un código promocional?",
    apply: "Aplicar",
    promoRejected: "Te enseñamos los precios sin descuento.",
    promoInvalid: "El código promocional no es válido.",
    searchError: "No se pudo consultar la disponibilidad.",
    connError: "No se pudo conectar con el sistema de reservas.",
    noRooms: "No hay habitaciones libres para esas fechas. Prueba con otras o escríbenos a",
    combine: "Ninguna habitación tiene plazas para todo el grupo: combina varias.",
    roomsAria: "Habitaciones disponibles",
    features: "Características",
    rate: "Tarifa",
    yourBooking: "Tu reserva",
    discount: "Descuento",
    taxes: "Impuestos",
    totalLabel: "Total",
    notFit: "Las habitaciones elegidas no tienen plazas para todo el grupo.",
    conditionsOf: "Condiciones de la",
    yourData: "Tus datos",
    comments: "Comentarios (opcional)",
    addMore: "Añadir más datos o un comentario (opcional)",
    payAndBook: "Reservar y pagar",
    requestWhatsApp: "Solicitar reserva por WhatsApp",
    requestShort: "Solicitar",
    saving: "Guardando tu reserva…",
    tpvNote:
      "Pago seguro con tarjeta en la pasarela de Redsys. Antes comprobamos otra vez la disponibilidad y el precio. Tienes 30 minutos para pagar; si no, la reserva se anula sola.",
    whatsappNote:
      "Se abre WhatsApp con tu solicitud ya escrita (habitación, fechas y datos): solo tienes que enviarla. Te confirmamos la disponibilidad por el mismo chat y todavía no se cobra nada. Al solicitar la reserva aceptas las",
    accept: "Al reservar aceptas las",
    privacy: "Usamos tus datos solo para gestionar tu reserva y, si hace falta, hacer tu factura.",
    preferWhatsApp: "¿Prefieres reservar por WhatsApp?",
    redirectTitle: "Te llevamos al pago seguro",
    redirectText: "Estamos guardando tu habitación. En unos segundos se abre la pasarela de pago con tarjeta (Redsys). No cierres esta ventana.",
  },

  cookies: {
    title: "Cookies",
    text: "Usamos lo técnico para que la web funcione y estadísticas anónimas, sin cookies. Con tu permiso, además, medimos las visitas y nuestros anuncios con Google y Meta, y cargamos el mapa de Google Maps. Todos instalan sus propias cookies.",
    policy: "Política de cookies",
    technical: "Técnicas",
    technicalText: "Necesarias para que la web funcione. Siempre activas.",
    active: "Activas",
    measurement: "Analítica y publicidad",
    measurementText: "Google Analytics, Google Ads y el píxel de Meta: cuántas visitas y reservas llegan de cada anuncio.",
    thirdParty: "Servicios de terceros",
    thirdPartyText: "Mapa de Google Maps en la página de Ubicación.",
    save: "Guardar",
    reject: "Rechazar",
    accept: "Aceptar",
    configure: "Configurar",
  },

  map: {
    text: "El mapa es de Google Maps y, al cargarlo, Google puede instalar sus cookies. Solo lo mostramos si nos das permiso.",
    button: "Aceptar y ver el mapa",
  },

  gallery: { close: "Cerrar fotos", prev: "Foto anterior", next: "Foto siguiente", thumbs: "Miniaturas" },
};

export type Dict = typeof es;
