import { pageMetadata } from "@/i18n/metadata";
import { LocationView } from "@/views/LocationView";

export const metadata = pageMetadata("location", "en");

export default function Page() {
  return <LocationView locale="en" />;
}
