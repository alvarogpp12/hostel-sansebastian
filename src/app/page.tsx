import type { Metadata } from "next";
import { FaqSchema } from "@/components/Schema";
import { Cta } from "@/components/sections/Cta";
import { BookingHero, HomeCity, HomeFaq, HomeFeatures, HomeIntro, RoomsHeading } from "@/components/sections/HomeSections";
import { ItemList } from "@/components/sections/PageSections";
import { home } from "@/content/home";
import { rooms } from "@/content/rooms";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: site.seo.title,
  description: site.seo.description,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <main id="content">
        <BookingHero />
        <HomeIntro />
        <div className="bg-white">
          <RoomsHeading />
          <ItemList id="habitaciones" srTitle={home.rooms.title} items={rooms} headingLevel="h3" />
        </div>
        <HomeFeatures />
        <HomeCity />
        <HomeFaq />
      </main>
      <Cta />
      <FaqSchema />
    </>
  );
}
