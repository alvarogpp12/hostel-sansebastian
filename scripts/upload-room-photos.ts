/**
 * Sube las fotos de las habitaciones a Vercel Blob y apunta en
 * src/content/room-photos.json la URL, el ancho y el alto de cada una.
 *
 * Uso:  npm run photos:upload -- <carpeta>
 *
 * La carpeta (fuera del repo) tiene los JPG ya preparados con el nombre
 * <habitacion>-<n>.jpg; n es el orden en la galería y la 1 es la portada.
 * Credenciales: BLOB_READ_WRITE_TOKEN, o BLOB_STORE_ID + VERCEL_OIDC_TOKEN,
 * en .env.local (`vercel env pull .env.local`). Nunca en el código.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import sharp from "sharp";

const ROOMS = ["doble", "dos-camas", "doble-privado", "familiar"] as const;
const MANIFEST = path.join(import.meta.dirname, "../src/content/room-photos.json");

type Photo = { src: string; width: number; height: number };

async function main() {
  const dir = process.argv[2];
  if (!dir) throw new Error("Falta la carpeta: npm run photos:upload -- <carpeta>");

  const files = (await readdir(dir)).filter((f) => /^[a-z-]+-\d+\.jpg$/.test(f));
  const manifest: Record<string, Photo[]> = {};

  for (const room of ROOMS) {
    const mine = files
      .filter((f) => f.startsWith(`${room}-`) && /^\d+$/.test(f.slice(room.length + 1, -4)))
      .sort((a, b) => Number(a.slice(room.length + 1, -4)) - Number(b.slice(room.length + 1, -4)));
    if (mine.length === 0) throw new Error(`No hay fotos de «${room}» en ${dir}`);

    manifest[room] = [];
    for (const name of mine) {
      const file = await readFile(path.join(dir, name));
      const { width, height } = await sharp(file).metadata();
      if (!width || !height) throw new Error(`No se pudo leer el tamaño de ${name}`);
      const blob = await put(`habitaciones/${name}`, file, {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: 31536000,
        contentType: "image/jpeg",
      });
      manifest[room].push({ src: blob.url, width, height });
      console.log(`${name}  ${width}x${height}  ${blob.url}`);
    }
  }

  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`\nManifiesto: ${path.relative(process.cwd(), MANIFEST)}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
