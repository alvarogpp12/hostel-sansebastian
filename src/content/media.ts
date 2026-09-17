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

export const media = {
  city: {
    bay: img("san-sebastian-bahia-la-concha", 2400, 1600, "Bahía de La Concha y la isla de Santa Clara en San Sebastián"),
    aerial: img("san-sebastian-playa-la-concha-vista-aerea", 2400, 1600, "Vista aérea de la playa de La Concha y el centro de San Sebastián"),
    comb: img("peine-del-viento-san-sebastian", 2400, 1600, "Escultura del Peine del Viento frente al mar en San Sebastián"),
    waves: img("peine-del-viento-olas", 2400, 1600, "Olas rompiendo en el Peine del Viento, Donostia"),
    pintxos: img("pintxos-san-sebastian", 1024, 685, "Gamba de un pintxo en San Sebastián"),
  },
  rooms: {
    individual: [
      img("habitacion-individual-1", 1024, 742, "Habitación individual económica en San Sebastián"),
      img("habitacion-individual-2", 739, 768, "Habitación individual con cama de forja"),
      img("habitacion-individual-3", 512, 768, "Habitación individual con suelo de madera"),
    ],
    double: [
      img("habitacion-doble-1", 1920, 1080, "Habitación doble barata en San Sebastián con cama grande"),
      img("habitacion-doble-2", 1920, 1080, "Habitación doble con ventana a la calle"),
      img("habitacion-dos-camas-1", 1024, 683, "Habitación con dos camas y cojines de flores"),
      img("habitacion-dos-camas-2", 1024, 582, "Habitación de dos camas con lámpara de lectura"),
      img("habitacion-dos-camas-3", 1024, 553, "Habitación de dos camas con armario de madera"),
      img("habitacion-dos-camas-4", 529, 768, "Habitación de dos camas con cortinas verdes"),
      img("habitacion-dos-camas-5", 512, 768, "Detalle de cama en habitación doble"),
    ],
    triple: [img("habitacion-triple-1", 1024, 540, "Habitación triple con tres camas en San Sebastián")],
  },
  bathrooms: [
    img("bano-compartido-1", 530, 768, "Baño compartido con lavabo y espejo"),
    img("bano-compartido-2", 494, 768, "Baño compartido con ducha"),
  ],
  detail: img("detalle-lampara", 1024, 683, "Detalle de lámpara en una habitación del hostal"),
};
