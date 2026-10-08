import { media, type Media } from "./media";
import type { IconName } from "./site";

export type RoomId = "doble" | "dos-camas" | "doble-privado" | "familiar";

export type Room = {
  id: RoomId;
  name: string;
  /** Etiqueta corta para las tarjetas del hero y el selector de reserva */
  short: string;
  guests: number;
  meta: string;
  /**
   * Precio mínimo por noche en euros. `null` = sin confirmar: la web muestra
   * "desde XX €" y el precio no se publica en los datos estructurados.
   */
  priceFrom: number | null;
  cardText: string;
  text: string;
  specs: { icon: IconName; text: string }[];
  image: Media;
  gallery: Media[];
};

export const rooms: Room[] = [
  {
    id: "doble",
    name: "Habitación doble con baño compartido",
    short: "Doble",
    guests: 2,
    meta: "1 o 2 personas · Cama de matrimonio · Baño compartido",
    priceFrom: null,
    cardText:
      "Una cama de matrimonio y tu propio espacio para descansar, tanto si vienes solo como en pareja.",
    text: "Un paseo por la bahía, una tarde descubriendo la ciudad y un lugar tranquilo donde descansar al terminar el día. La habitación doble de Enjoy Comfort tiene una cama de matrimonio y es perfecta para una o dos personas. El baño se comparte con otros huéspedes.",
    specs: [
      { icon: "bed", text: "Cama de matrimonio" },
      { icon: "users", text: "Para una o dos personas" },
      { icon: "key", text: "Habitación de uso privado" },
      { icon: "shower", text: "Baño compartido" },
    ],
    image: media.rooms.double[0],
    gallery: [media.rooms.double[1], ...media.bathrooms],
  },
  {
    id: "dos-camas",
    name: "Habitación de dos camas con baño compartido",
    short: "Dos camas",
    guests: 2,
    meta: "1 o 2 personas · Dos camas individuales · Baño compartido",
    priceFrom: null,
    cardText:
      "Dos camas separadas para viajar con un amigo, un familiar o un compañero de trabajo, cada uno a su aire.",
    text: "Si viajáis juntos pero preferís dormir cada uno en su cama, esta es vuestra habitación. Tiene dos camas individuales y es de uso privado para una o dos personas. El baño se comparte con otros huéspedes.",
    specs: [
      { icon: "bed", text: "Dos camas individuales" },
      { icon: "users", text: "Para una o dos personas" },
      { icon: "key", text: "Habitación de uso privado" },
      { icon: "shower", text: "Baño compartido" },
    ],
    image: media.rooms.twin[0],
    gallery: [...media.rooms.twin.slice(1), ...media.bathrooms],
  },
  {
    id: "doble-privado",
    name: "Habitación doble con baño privado",
    short: "Doble con baño privado",
    guests: 2,
    meta: "2 personas · Cama de matrimonio · Baño privado exterior",
    priceFrom: null,
    cardText:
      "La comodidad de tener un baño solo para vosotros, justo fuera de la habitación.",
    text: "Para quienes prefieren no compartir baño. Esta habitación doble tiene cama de matrimonio y un baño privado de uso exclusivo, situado fuera de la habitación. Toda la tranquilidad de tener tu propio espacio en pleno San Sebastián.",
    specs: [
      { icon: "bed", text: "Cama de matrimonio" },
      { icon: "users", text: "Para dos personas" },
      { icon: "key", text: "Habitación de uso privado" },
      { icon: "shower", text: "Baño privado, fuera de la habitación" },
    ],
    // PENDIENTE: fotos de esta habitación y de su baño
    image: media.rooms.double[1],
    gallery: [media.rooms.double[0], media.detail],
  },
  {
    id: "familiar",
    name: "Habitación familiar con baño privado",
    short: "Familiar",
    // VERIFICAR con el cliente: capacidad máxima (2 camas de matrimonio)
    guests: 4,
    meta: "Hasta 4 personas · Dos camas de matrimonio · Baño privado",
    priceFrom: null,
    cardText:
      "Dos camas de matrimonio y baño privado para venir en familia o con amigos y estar todos juntos.",
    text: "Cuando viajáis en familia o en grupo, alojaros en la misma habitación lo hace todo más fácil. La habitación familiar tiene dos camas de matrimonio y baño privado, para que tengáis vuestro propio espacio mientras descubrís San Sebastián.",
    specs: [
      { icon: "bed", text: "Dos camas de matrimonio" },
      { icon: "users", text: "Hasta cuatro personas" },
      { icon: "key", text: "Habitación de uso privado" },
      { icon: "shower", text: "Baño privado" },
    ],
    // PENDIENTE: fotos de esta habitación y de su baño
    image: media.rooms.family[0],
    gallery: [media.detail],
  },
];

export const priceLabel = (room: Room) => (room.priceFrom === null ? "Consultar precio" : `desde ${room.priceFrom} €`);

/** ¿Hay tarifa confirmada? Si no, no se enseña el sufijo "/noche". */
export const hasPrice = (room: Room) => room.priceFrom !== null;

export const roomById = (id: string | null | undefined) => rooms.find((r) => r.id === id);
