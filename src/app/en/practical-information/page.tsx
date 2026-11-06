import { pageMetadata } from "@/i18n/metadata";
import { PracticalView } from "@/views/PracticalView";

export const metadata = pageMetadata("practical", "en");

export default function Page() {
  return <PracticalView locale="en" />;
}
