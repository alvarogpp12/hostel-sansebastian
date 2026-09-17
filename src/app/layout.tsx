import type { Metadata } from "next";
import { Inter, Karla, Newsreader } from "next/font/google";
import { Intro } from "@/components/Intro";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { site } from "@/content/site";
import { LocalBusinessSchema } from "@/components/Schema";
import "./globals.css";

/*
 * Fuentes. Inter para los textos en versalita, Karla para el cuerpo y
 * Newsreader para los titulares (sustituta libre de TT Ramillas).
 */
const inter = Inter({ subsets: ["latin"], weight: ["300", "500"], variable: "--font-inter" });
// Solo la variante Light: el cuerpo de texto se renderiza a 300.
const karla = Karla({ subsets: ["latin"], weight: ["300"], variable: "--font-karla" });
const heading = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.seo.title, template: `%s · ${site.brand.name}` },
  description: site.seo.description,
  keywords: site.seo.keywords,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: site.brand.name,
    title: site.seo.title,
    description: site.seo.description,
    url: site.url,
    images: [{ url: "/media/san-sebastian-bahia-la-concha.jpg", width: 2400, height: 1600, alt: "Bahía de La Concha, San Sebastián" }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // `suppressHydrationWarning`: el script de arriba marca <html> antes de que
    // React hidrate, así que el atributo no está en el HTML del servidor.
    <html
      lang="es"
      className={`${inter.variable} ${karla.variable} ${heading.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/* Se ejecuta antes de pintar el resto del body: si la cortinilla ya
            se vio en esta visita, el CSS la oculta y no se ve ni un fotograma. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{if(sessionStorage.getItem("ec-intro-visto")==="1")document.documentElement.dataset.introVisto="1"}catch(e){}',
          }}
        />
        <Intro />
        <SmoothScroll>{children}</SmoothScroll>
        <LocalBusinessSchema />
      </body>
    </html>
  );
}
