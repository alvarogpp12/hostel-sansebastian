import { pageMetadata } from "@/i18n/metadata";
import { HomeView } from "@/views/HomeView";

export const metadata = pageMetadata("home", "en");

export default function Page() {
  return <HomeView locale="en" />;
}
