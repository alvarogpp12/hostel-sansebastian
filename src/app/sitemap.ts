import type { MetadataRoute } from "next";
import { site } from "@/content/site";

const PATHS = ["/", "/habitaciones", "/ubicacion", "/info-practica", "/reservar", "/privacidad", "/terminos", "/aviso-legal", "/cookies"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PATHS.map((path) => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/reservar" || path === "/habitaciones" ? 0.8 : 0.5,
  }));
}
