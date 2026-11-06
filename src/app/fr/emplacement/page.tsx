import { pageMetadata } from "@/i18n/metadata";
import { LocationView } from "@/views/LocationView";

export const metadata = pageMetadata("location", "fr");

export default function Page() {
  return <LocationView locale="fr" />;
}
