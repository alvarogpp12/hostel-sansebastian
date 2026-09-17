import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/LegalPage";
import { legal } from "@/content/pages";

export const metadata: Metadata = { title: legal.terms.title };

export default function TermsPage() {
  return <LegalPage {...legal.terms} />;
}
