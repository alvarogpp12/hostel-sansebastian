import { media } from "./media";
import type { IconName } from "./site";

export const home = {
  hero: {
    /** H1: lleva la palabra clave, en versalita sobre el titular grande */
    h1: "Tu alojamiento céntrico en San Sebastián",
    title: ["Descansa a gusto.", "Disfruta de Donosti."],
    slides: [media.city.bay, media.city.aerial, media.city.comb],
    cardsLabel: "Encuentra tu habitación",
  },

  intro: {
    eyebrow: "Céntrico, cómodo y tranquilo",
    paragraphs: [
      "Ubicado en el barrio preferido por los donostiarras, Enjoy Comfort te ofrece distintos tipos de habitaciones para que puedas organizarte según con quién vayas. Aquí encontrarás un lugar céntrico, cómodo y tranquilo que te pondrá a tiro de piedra los principales atractivos de la ciudad.",
    ],
  },

  rooms: {
    eyebrow: "Habitaciones",
    title: "Encuentra tu habitación en Donosti",
    text: "Cada viaje es diferente. Elige la habitación que mejor encaje con el tuyo y consulta disponibilidad para tus fechas.",
  },

  features: {
    title: "¿Por qué elegir Enjoy Comfort?",
    items: [
      {
        icon: "key",
        title: "Una habitación para cada viaje",
        text: "Doble, de dos camas o familiar, con baño compartido o privado. Elige según con quién vengas: la habitación es de uso exclusivo para tu reserva.",
      },
      {
        icon: "marker",
        title: "En pleno centro",
        text: "En un plis plas estás en la playa de Gros y el Kursaal, y la Parte Vieja y el centro quedan a un corto paseo.",
      },
      {
        icon: "sparkle",
        title: "Espacios cuidados",
        text: "Un entorno acogedor para descansar y recuperar fuerzas después de un día recorriendo San Sebastián.",
      },
      {
        icon: "globe",
        title: "Contacto directo con nosotros",
        text: "Consulta disponibilidad, plantea tus dudas y prepara tu llegada hablando con Enjoy Comfort. Te ayudamos a elegir entre las opciones disponibles.",
      },
      {
        icon: "heart",
        title: "Trato cercano",
        text: "Cada viaje tiene sus preguntas. Estamos aquí para orientarte sobre tu estancia y ayudarte a disfrutar de la ciudad.",
      },
    ] satisfies { icon: IconName; title: string; text: string }[],
  },

  city: {
    eyebrow: "San Sebastián se disfruta a tu ritmo",
    title: "Planes para llenar tu escapada sin organizar cada minuto",
    items: [
      {
        title: "Un paseo por La Concha",
        text: "Recorre la bahía, camina junto a la playa y busca un momento para sentarte frente al mar.",
        image: media.city.bay,
      },
      {
        title: "El Peine del Viento",
        text: "Las esculturas de Eduardo Chillida junto al Cantábrico, donde el arte se encuentra con el mar.",
        image: media.city.comb,
      },
      {
        title: "La Parte Vieja y el centro",
        text: "Piérdete por sus calles y recorre el Boulevard. Parte del encanto está en descubrirla sin prisas.",
        image: media.city.aerial,
      },
      {
        title: "Una ruta de pintxos",
        text: "Dedica un rato a la gastronomía local. Elige tus bares y disfruta de una ruta a tu medida.",
        image: media.city.pintxos,
      },
    ],
  },

  faq: {
    title: "Preguntas frecuentes",
    items: [
      {
        q: "¿Qué tipo de alojamiento es Enjoy Comfort?",
        a: "Enjoy Comfort es una pensión de una estrella en el centro de San Sebastián, a pocos minutos de la playa de Gros y de la Parte Vieja. Tenemos habitaciones dobles, de dos camas y familiares, con baño compartido o privado según la habitación.",
      },
      {
        q: "¿Las habitaciones son privadas?",
        a: "Sí. Todas las habitaciones son privadas: solo las compartirás con las personas que viajan contigo.",
      },
      {
        q: "¿Los baños son privados o compartidos?",
        a: "Depende de la habitación. La doble y la de dos camas comparten baño con otros huéspedes. La doble con baño privado tiene un baño de uso exclusivo situado fuera de la habitación, y la familiar tiene baño privado.",
      },
      {
        q: "¿Puedo elegir entre cama de matrimonio o dos camas?",
        a: "Sí. Tenemos habitación doble con cama de matrimonio y habitación con dos camas individuales. Las dos se pueden reservar para una o dos personas.",
      },
      {
        q: "¿Tenéis habitaciones para familias?",
        a: "Sí. La habitación familiar tiene dos camas de matrimonio y baño privado, y es de uso exclusivo para las personas incluidas en la reserva.",
      },
      {
        q: "¿Cuánto cuesta alojarse en Enjoy Comfort?",
        a: "El precio depende del tipo de habitación y de las fechas de tu estancia. Indícanos cuándo quieres venir y cuántas personas viajáis para conocer la disponibilidad y el importe correspondiente.",
      },
      {
        q: "¿Cómo puedo reservar?",
        a: "Utiliza el formulario de la web para indicarnos las fechas, el número de personas y la habitación que te interesa. Te confirmaremos la disponibilidad, el precio y los pasos para completar la reserva.",
      },
      {
        q: "¿Dónde puedo consultar la información para mi llegada?",
        a: "En la sección de información práctica encontrarás los detalles para preparar tu estancia. Si tienes alguna duda antes de reservar o de llegar, puedes contactar directamente con nosotros.",
      },
    ],
  },
};
