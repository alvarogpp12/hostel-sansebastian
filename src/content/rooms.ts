import { media, type Media } from "./media";
import type { IconName } from "./site";

export type RoomId = "individual" | "doble" | "triple";

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
    id: "individual",
    name: "Habitación individual",
    short: "Individual",
    guests: 1,
    meta: "1 persona · Cama individual · Baño compartido",
    priceFrom: null,
    cardText:
      "Tu propio espacio para descansar cuando viajas solo. Una habitación privada y sencilla para disfrutar de San Sebastián a tu ritmo.",
    text: "Si viajas por tu cuenta, tener un espacio propio marca la diferencia. Nuestra habitación individual cuenta con una cama individual para que puedas descansar y organizar tus planes con tranquilidad. Una opción para quienes buscan una habitación económica en San Sebastián y prefieren alojarse sin compartir dormitorio.",
    specs: [
      { icon: "bed", text: "Cama individual" },
      { icon: "users", text: "Capacidad para una persona" },
      { icon: "key", text: "Habitación de uso privado" },
      { icon: "shower", text: "Baño compartido" },
    ],
    image: media.rooms.individual[0],
    gallery: [...media.rooms.individual.slice(1), ...media.bathrooms],
  },
  {
    id: "doble",
    name: "Habitación doble o de dos camas",
    short: "Doble / Dos camas",
    guests: 2,
    meta: "2 personas · Cama doble o dos camas individuales · Baño compartido",
    priceFrom: null,
    cardText:
      "Un espacio para compartir en pareja o con un amigo. Cuéntanos qué tipo de cama prefieres y te confirmaremos las opciones disponibles.",
    text: "Un paseo por la bahía, una tarde descubriendo la ciudad y un lugar donde descansar al terminar el día. La habitación doble de Enjoy Comfort está pensada para dos personas. Disponemos de opciones con cama doble o dos camas individuales: indícanos tu preferencia al consultar y te confirmaremos la disponibilidad.",
    specs: [
      { icon: "bed", text: "Cama doble o dos camas individuales, según disponibilidad" },
      { icon: "users", text: "Capacidad para dos personas" },
      { icon: "key", text: "Habitación de uso privado" },
      { icon: "shower", text: "Baño compartido" },
    ],
    image: media.rooms.double[0],
    gallery: [...media.rooms.double.slice(1), ...media.bathrooms],
  },
  {
    id: "triple",
    name: "Habitación triple",
    short: "Triple",
    guests: 3,
    meta: "3 personas · Tres camas individuales · Baño compartido",
    priceFrom: null,
    cardText:
      "Para una escapada con amigos o en familia. Alojaos juntos y disfrutad de la comodidad de tener una habitación privada para vosotros.",
    text: "Cuando viajáis tres, alojaros en la misma habitación facilita los planes y permite compartir el gasto del alojamiento. Nuestra habitación triple dispone de tres camas individuales y un espacio privado para vuestro grupo. Una opción práctica para conocer San Sebastián con amigos o en familia.",
    specs: [
      { icon: "bed", text: "Tres camas individuales" },
      { icon: "users", text: "Capacidad para tres personas" },
      { icon: "key", text: "Habitación de uso privado" },
      { icon: "shower", text: "Baño compartido" },
    ],
    image: media.rooms.triple[0],
    gallery: [...media.bathrooms, media.detail],
  },
];

export const priceLabel = (room: Room) => (room.priceFrom === null ? "Consultar precio" : `desde ${room.priceFrom} €`);

/** ¿Hay tarifa confirmada? Si no, no se enseña el sufijo "/noche". */
export const hasPrice = (room: Room) => room.priceFrom !== null;

export const roomById = (id: string | null | undefined) => rooms.find((r) => r.id === id);
