/**
 * Media registry. Every image in the site is referenced from here.
 * Files live in /public/media (optimised copies of the client's photos).
 * `alt` texts are written for accessibility first and SEO second.
 */

export type Media = { src: string; width: number; height: number; alt: string };

const img = (name: string, width: number, height: number, alt: string): Media => ({
  src: `/media/${name}.jpg`,
  width,
  height,
  alt,
});

/** Fotos de las habitaciones: /public/media/habitaciones (nuestro almacenamiento, no Redforts) */
const photo = (name: string, width: number, height: number, alt: string): Media => ({
  src: `/media/habitaciones/${name}.jpg`,
  width,
  height,
  alt,
});

export const media = {
  city: {
    bay: img("san-sebastian-bahia-la-concha", 2400, 1600, "Bahía de La Concha y la isla de Santa Clara en San Sebastián"),
    aerial: img("san-sebastian-playa-la-concha-vista-aerea", 2400, 1600, "Vista aérea de la playa de La Concha y el centro de San Sebastián"),
    comb: img("peine-del-viento-san-sebastian", 2400, 1600, "Escultura del Peine del Viento frente al mar en San Sebastián"),
    waves: img("peine-del-viento-olas", 2400, 1600, "Olas rompiendo en el Peine del Viento, Donostia"),
    pintxos: img("pintxos-san-sebastian", 1024, 685, "Gamba de un pintxo en San Sebastián"),
  },
  /**
   * Fotos de cada habitación, en el orden en que se enseñan (la primera es la
   * portada). Para cambiarlas: sustituir el archivo en public/media/habitaciones
   * con el mismo nombre, o añadir/quitar líneas aquí.
   */
  roomPhotos: {
    "doble": [
      photo("doble-1", 960, 540, "Habitación doble con baño compartido en Enjoy Comfort, San Sebastián (foto 1)"),
      photo("doble-2", 960, 540, "Habitación doble con baño compartido en Enjoy Comfort, San Sebastián (foto 2)"),
      photo("doble-3", 960, 540, "Habitación doble con baño compartido en Enjoy Comfort, San Sebastián (foto 3)"),
      photo("doble-4", 960, 540, "Habitación doble con baño compartido en Enjoy Comfort, San Sebastián (foto 4)"),
      photo("doble-5", 960, 540, "Habitación doble con baño compartido en Enjoy Comfort, San Sebastián (foto 5)"),
      photo("doble-6", 960, 540, "Habitación doble con baño compartido en Enjoy Comfort, San Sebastián (foto 6)"),
      photo("doble-7", 960, 540, "Habitación doble con baño compartido en Enjoy Comfort, San Sebastián (foto 7)"),
    ],
    "dos-camas": [
      photo("dos-camas-1", 960, 540, "Habitación de dos camas con baño compartido en Enjoy Comfort, San Sebastián (foto 1)"),
      photo("dos-camas-2", 960, 540, "Habitación de dos camas con baño compartido en Enjoy Comfort, San Sebastián (foto 2)"),
      photo("dos-camas-3", 960, 540, "Habitación de dos camas con baño compartido en Enjoy Comfort, San Sebastián (foto 3)"),
      photo("dos-camas-4", 960, 540, "Habitación de dos camas con baño compartido en Enjoy Comfort, San Sebastián (foto 4)"),
      photo("dos-camas-5", 960, 540, "Habitación de dos camas con baño compartido en Enjoy Comfort, San Sebastián (foto 5)"),
      photo("dos-camas-6", 960, 540, "Habitación de dos camas con baño compartido en Enjoy Comfort, San Sebastián (foto 6)"),
      photo("dos-camas-7", 960, 540, "Habitación de dos camas con baño compartido en Enjoy Comfort, San Sebastián (foto 7)"),
    ],
    "doble-privado": [
      photo("doble-privado-1", 960, 540, "Habitación doble con baño privado en Enjoy Comfort, San Sebastián (foto 1)"),
      photo("doble-privado-2", 960, 540, "Habitación doble con baño privado en Enjoy Comfort, San Sebastián (foto 2)"),
      photo("doble-privado-3", 960, 540, "Habitación doble con baño privado en Enjoy Comfort, San Sebastián (foto 3)"),
      photo("doble-privado-4", 960, 540, "Habitación doble con baño privado en Enjoy Comfort, San Sebastián (foto 4)"),
      photo("doble-privado-5", 960, 540, "Habitación doble con baño privado en Enjoy Comfort, San Sebastián (foto 5)"),
      photo("doble-privado-6", 960, 540, "Habitación doble con baño privado en Enjoy Comfort, San Sebastián (foto 6)"),
      photo("doble-privado-7", 960, 540, "Habitación doble con baño privado en Enjoy Comfort, San Sebastián (foto 7)"),
      photo("doble-privado-8", 960, 540, "Habitación doble con baño privado en Enjoy Comfort, San Sebastián (foto 8)"),
    ],
    "familiar": [
      photo("familiar-1", 960, 540, "Habitación familiar con baño privado en Enjoy Comfort, San Sebastián (foto 1)"),
      photo("familiar-2", 960, 540, "Habitación familiar con baño privado en Enjoy Comfort, San Sebastián (foto 2)"),
      photo("familiar-3", 960, 540, "Habitación familiar con baño privado en Enjoy Comfort, San Sebastián (foto 3)"),
      photo("familiar-4", 960, 540, "Habitación familiar con baño privado en Enjoy Comfort, San Sebastián (foto 4)"),
      photo("familiar-5", 960, 540, "Habitación familiar con baño privado en Enjoy Comfort, San Sebastián (foto 5)"),
    ],
  },
  rooms: {
    double: [
      img("habitacion-doble-1", 1920, 1080, "Habitación doble con cama de matrimonio en San Sebastián"),
      img("habitacion-doble-2", 1920, 1080, "Habitación doble con ventana a la calle"),
    ],
    twin: [
      img("habitacion-dos-camas-1", 1024, 683, "Habitación con dos camas y cojines de flores en San Sebastián"),
      img("habitacion-dos-camas-2", 1024, 582, "Habitación de dos camas con lámpara de lectura"),
      img("habitacion-dos-camas-3", 1024, 553, "Habitación de dos camas con armario de madera"),
      img("habitacion-dos-camas-4", 529, 768, "Habitación de dos camas con cortinas verdes"),
      img("habitacion-dos-camas-5", 512, 768, "Detalle de cama en habitación de dos camas"),
    ],
    // PENDIENTE: foto real de la habitación familiar (de momento, la de la antigua triple)
    family: [img("habitacion-triple-1", 1024, 540, "Habitación familiar en San Sebastián")],
  },
  bathrooms: [
    img("bano-compartido-1", 530, 768, "Baño compartido con lavabo y espejo"),
    img("bano-compartido-2", 494, 768, "Baño compartido con ducha"),
  ],
  detail: img("detalle-lampara", 1024, 683, "Detalle de lámpara en una habitación de Enjoy Comfort"),
};
