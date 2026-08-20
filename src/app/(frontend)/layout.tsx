import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";

import { Analytics } from "@/components/Analytics";
import { CookieBanner } from "@/components/CookieBanner";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SiteNoticeBanner } from "@/components/layout/SiteNoticeBanner";
import { Toaster } from "@/components/ui/sonner";
import { getFormations, getSiteSettings } from "@/lib/data";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { organizationJsonLd } from "@/lib/seo";

import "../globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const themeInitScript = `(function(){try{var t=localStorage.getItem("cinemergence-theme");if(t==="light"){document.documentElement.classList.remove("dark");}else{document.documentElement.classList.add("dark");}}catch(e){document.documentElement.classList.add("dark");}})();`;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return {
    metadataBase: new URL(site.url),
    title: {
      default: `${site.name} — École de formation cinéma Paris`,
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
    <ClerkProvider
      appearance={clerkAppearance}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
    >
      <html lang="fr" className="dark min-h-dvh" suppressHydrationWarning>
        <body className="flex min-h-dvh flex-col overflow-x-clip">
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
          <main className="flex-1 overflow-x-clip pt-[calc(var(--site-notice-h)+4rem+env(safe-area-inset-top,0px))] md:pt-[calc(var(--site-notice-h)+4.5rem+env(safe-area-inset-top,0px))]">
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
          <CookieBanner />
          <Analytics />
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
