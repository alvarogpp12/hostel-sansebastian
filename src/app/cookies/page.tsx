import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/LegalPage";
import { legal } from "@/content/pages";

export const metadata: Metadata = { title: legal.cookies.title, alternates: { canonical: "/cookies" } };

export default function CookiesPage() {
  return <LegalPage {...legal.cookies} />;
}
