import { pageMetadata } from "@/i18n/metadata";
import { PracticalView } from "@/views/PracticalView";

export const metadata = pageMetadata("practical", "fr");

export default function Page() {
  return <PracticalView locale="fr" />;
}
