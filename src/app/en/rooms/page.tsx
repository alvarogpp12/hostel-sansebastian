import { pageMetadata } from "@/i18n/metadata";
import { RoomsView } from "@/views/RoomsView";

export const metadata = pageMetadata("rooms", "en");

export default function Page() {
  return <RoomsView locale="en" />;
}
