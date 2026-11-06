import { pageMetadata } from "@/i18n/metadata";
import { BookView } from "@/views/BookView";

export const metadata = pageMetadata("book", "en");

/**
 * Se regenera cada 10 min: si Redforts no respondía al construir la página
 * (aviso de contacto), no se queda así hasta el siguiente despliegue.
 */
export const revalidate = 600;

export default function Page() {
  return <BookView locale="en" />;
}
