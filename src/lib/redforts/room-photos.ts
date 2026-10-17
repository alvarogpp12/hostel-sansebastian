import "server-only";
import { booking } from "@/content/booking";
import type { Media } from "@/content/media";
import { rooms, type RoomId } from "@/content/rooms";
import { isRedfortsConfigured } from "./client";
import { getInventory, pickLang } from "./inventory";

export type RoomPhotos = Partial<Record<RoomId, Media[]>>;

/**
 * Fotos de cada habitación de la web sacadas de Redforts (`booking.accoIds`
 * dice qué alojamiento es cada una). Así, lo que se sube a Redforts sale en la
 * web sin tocar código.
 *
 * Una habitación sin fotos en Redforts no aparece en el resultado y la web usa
 * las suyas (`content/rooms.ts`). Si Redforts no está configurado o falla,
 * devuelve {} y la web se ve igual que siempre.
 *
 * Usa el inventario cacheado (1 h, se invalida antes si cambia la versión).
 */
export async function getRoomPhotos(): Promise<RoomPhotos> {
  if (!isRedfortsConfigured()) return {};
  try {
    const inv = await getInventory();
    const texts = inv.languages[pickLang(inv, "es")];
    const out: RoomPhotos = {};
    for (const room of rooms) {
      const accoId = booking.accoIds[room.id];
      const acco = accoId ? inv.accos[accoId] : undefined;
      if (!acco) continue;
      const photos: Media[] = [];
      for (const imageId of acco.images) {
        const image = inv.images[String(imageId)];
        if (!image) continue;
        photos.push({
          src: image.url,
          // Redforts no da las medidas: la web pinta sus fotos con `fill`
          width: 0,
          height: 0,
          alt: texts?.images[String(imageId)]?.name || `${room.name}, foto ${photos.length + 1}`,
        });
      }
      if (photos.length) out[room.id] = photos;
    }
    return out;
  } catch (error) {
    console.error("[room-photos] no se pudieron leer las fotos de Redforts", error);
    return {};
  }
}
