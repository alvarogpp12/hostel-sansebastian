import { media } from "./media";
import type { IconName } from "./site";

export const home = {
  hero: {
    /** H1: lleva la palabra clave, en versalita sobre el titular grande */
    h1: "Tu hostal económico en San Sebastián",
    title: ["Descansa a gusto.", "Disfruta de Donosti."],
    slides: [media.city.bay, media.city.aerial, media.city.comb],
    cardsLabel: "Encuentra tu habitación",
  },

  intro: {
    eyebrow: "Una estancia sencilla, con lo que necesitas",
    paragraphs: [
      "Disfrutar de San Sebastián empieza por encontrar un alojamiento que encaje contigo y con tu presupuesto. En Enjoy Comfort te ofrecemos habitaciones privadas, espacios cuidados y atención cercana.",
      "Los baños son compartidos con otros huéspedes; la habitación es exclusivamente para ti y para las personas que viajan contigo. Así puedes elegir un alojamiento económico sin renunciar a tener tu propio espacio.",
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
        title: "Tu propia habitación",
        text: "Aquí no compartes dormitorio con otros huéspedes. Tanto si vienes solo como acompañado, la habitación es de uso exclusivo para tu reserva.",
      },
      {
        icon: "tag",
        title: "Un alojamiento para cuidar tu presupuesto",
        text: "Una estancia sencilla, con habitaciones de distintas capacidades para que encuentres la opción que encaje con tu viaje. Consulta el precio para tus fechas antes de reservar.",
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
        a: "Enjoy Comfort es un hostal económico en San Sebastián con habitaciones privadas individuales, dobles y triples. Los baños son compartidos con otros huéspedes. Es una opción para quienes buscan un alojamiento sencillo, trato cercano y un dormitorio de uso exclusivo.",
      },
      {
        q: "¿Las habitaciones son privadas?",
        a: "Sí. Todas las habitaciones son privadas. Si reservas una individual, será solo para ti; si eliges una doble o una triple, la compartirás únicamente con tus acompañantes.",
      },
      {
        q: "¿Los baños son privados o compartidos?",
        a: "Los baños son compartidos con otros huéspedes del alojamiento. Las habitaciones no disponen de baño privado.",
      },
      {
        q: "¿Puedo solicitar una cama doble o dos camas individuales?",
        a: "Sí. Al consultar una habitación para dos personas, indícanos qué distribución prefieres. Te confirmaremos si está disponible para las fechas de tu estancia.",
      },
      {
        q: "¿Tenéis habitaciones para tres personas?",
        a: "Sí. La habitación triple cuenta con tres camas individuales y es de uso privado para las personas incluidas en la reserva.",
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
