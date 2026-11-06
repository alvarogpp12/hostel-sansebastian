import { pageMetadata } from "@/i18n/metadata";
import { PracticalView } from "@/views/PracticalView";

export const metadata = pageMetadata("practical", "es");

export default function Page() {
  return <PracticalView locale="es" />;
}
