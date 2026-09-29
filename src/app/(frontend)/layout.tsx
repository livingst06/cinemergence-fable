import type { Metadata, Viewport } from "next";
import { Allura, Bodoni_Moda, Oswald, Source_Sans_3 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { DeferredSiteChrome } from "@/components/DeferredSiteChrome";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SiteNoticeBanner } from "@/components/layout/SiteNoticeBanner";
import { getFormations, getSiteSettings } from "@/lib/data";
import { organizationJsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";

import "../globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans",
});

const oswald = Oswald({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-oswald",
});

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bodoni",
});

const allura = Allura({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-allura",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const themeInitScript = `(function(){var r=document.documentElement;r.classList.add("dark");try{if(localStorage.getItem("cinemergence-notice")==="dismissed"){r.classList.add("site-notice-dismissed");}}catch(e){}document.addEventListener("change",function(e){if(e.target&&e.target.id==="site-notice-dismiss"){r.classList.add("site-notice-dismissed");try{localStorage.setItem("cinemergence-notice","dismissed")}catch(err){}}});})();`;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return {
    metadataBase: new URL(site.url),
    title: {
      default: `${site.name} — École de formation cinéma Paris`,
      template: `%s | ${site.name}`,
    },
    description: site.description,
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
      date: false,
    },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      siteName: site.name,
    },
  };
}

export default async function FrontendLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [site, formations] = await Promise.all([getSiteSettings(), getFormations()]);
  const jsonLd = organizationJsonLd(site);

  return (
    <html
      lang="fr"
      className={cn(
        sourceSans.variable,
        oswald.variable,
        bodoni.variable,
        allura.variable,
        "dark min-h-dvh",
      )}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="flex min-h-dvh flex-col overflow-x-hidden">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SiteNoticeBanner nda={site.nda} />
        <Header
          formations={formations.map((f) => ({
            slug: f.slug,
            titreCourt: f.titreCourt,
            prioritaire: f.prioritaire,
          }))}
        />
        <main className="flex-1 overflow-x-hidden pt-[calc(var(--site-notice-h)+var(--site-header-h)+env(safe-area-inset-top,0px))]">
          {children}
        </main>
        <Footer
          site={site}
          formations={formations.map((f) => ({
            slug: f.slug,
            titreCourt: f.titreCourt,
            prioritaire: f.prioritaire,
          }))}
        />
        <DeferredSiteChrome />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
