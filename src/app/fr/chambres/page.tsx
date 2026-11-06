import { pageMetadata } from "@/i18n/metadata";
import { RoomsView } from "@/views/RoomsView";

export const metadata = pageMetadata("rooms", "fr");

export default function Page() {
  return <RoomsView locale="fr" />;
}
