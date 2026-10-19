import { WhatsAppGlyph } from "@/components/icons";
import { site } from "@/content/site";

/** Botón flotante para escribir por WhatsApp al móvil del alojamiento */
export function WhatsAppButton() {
  const { href, label } = site.contact.whatsapp;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="fixed right-4 bottom-4 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-[transform,bottom] duration-300 hover:scale-110 max-lg:[body[data-bookbar]_&]:bottom-[calc(5rem+env(safe-area-inset-bottom))] focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:outline-none lg:right-6 lg:bottom-6 [body.has-menu_&]:hidden"
    >
      <WhatsAppGlyph className="size-7" />
    </a>
  );
}
