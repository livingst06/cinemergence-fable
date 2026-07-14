import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Bebas_Neue, Plus_Jakarta_Sans } from "next/font/google";

import { Analytics } from "@/components/Analytics";
import { CookieBanner } from "@/components/CookieBanner";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Toaster } from "@/components/ui/sonner";
import { getFormations, getSiteSettings } from "@/lib/data";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { organizationJsonLd } from "@/lib/seo";

import "../globals.css";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

const themeInitScript = `(function(){try{var t=localStorage.getItem("cinemergence-theme");if(t==="light"){document.documentElement.classList.remove("dark");}else{document.documentElement.classList.add("dark");}}catch(e){document.documentElement.classList.add("dark");}})();`;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return {
    metadataBase: new URL(site.url),
    title: {
      default: `${site.name} — Formation cinéma Paris`,
      template: `%s | ${site.name}`,
    },
    description: site.description,
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
    <ClerkProvider appearance={clerkAppearance}>
      <html lang="fr" className={`${bebas.variable} ${jakarta.variable} dark h-full`} suppressHydrationWarning>
        <body className="min-h-full flex flex-col">
          <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          <Header
            formations={formations.map((f) => ({
              slug: f.slug,
              titreCourt: f.titreCourt,
              prioritaire: f.prioritaire,
            }))}
          />
          <main className="flex-1 overflow-x-clip pt-16 md:pt-[4.5rem]">{children}</main>
          <Footer
            site={site}
            formations={formations.map((f) => ({
              slug: f.slug,
              titreCourt: f.titreCourt,
            }))}
          />
          <CookieBanner />
          <Analytics />
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
