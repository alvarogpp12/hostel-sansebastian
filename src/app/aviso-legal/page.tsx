import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/LegalPage";
import { legal } from "@/content/pages";

export const metadata: Metadata = { title: legal.notice.title, alternates: { canonical: "/aviso-legal" } };

export default function LegalNoticePage() {
  return <LegalPage {...legal.notice} />;
}
