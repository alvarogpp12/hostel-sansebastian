import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/LegalPage";
import { legal } from "@/content/pages";

export const metadata: Metadata = { title: legal.privacy.title };

export default function PrivacyPage() {
  return <LegalPage {...legal.privacy} />;
}
