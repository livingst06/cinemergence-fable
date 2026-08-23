import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";

import { DeferredSiteChrome } from "@/components/DeferredSiteChrome";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SiteNoticeBanner } from "@/components/layout/SiteNoticeBanner";
import { AdminUiProvider } from "@/features/admin/AdminUiContext";
import { getFormations, getSiteSettings } from "@/lib/data";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { clerkAllowedRedirectOrigins } from "@/lib/clerk-origins";
import { getSessionProfile } from "@/lib/session-profile";
import { organizationJsonLd } from "@/lib/seo";

import "../globals.css";

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
    // Safari / Chrome iOS transforment le NDA en lien tel: → mismatch d’hydratation.
    formatDetection: {
      telephone: false,
      date: false,
      email: false,
      address: false,
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
  const [site, formations, profile] = await Promise.all([
    getSiteSettings(),
    getFormations(),
    getSessionProfile(),
  ]);
  const jsonLd = organizationJsonLd(site);

  return (
    <html lang="fr" className="dark min-h-dvh" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="flex min-h-dvh flex-col overflow-x-clip">
        <ClerkProvider
          appearance={clerkAppearance}
          allowedRedirectOrigins={clerkAllowedRedirectOrigins}
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          signInFallbackRedirectUrl="/"
          signUpFallbackRedirectUrl="/"
        >
          <AdminUiProvider
            initialUserEmail={profile.email}
            initialIsAdminEligible={profile.isAdminEligible}
          >
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
            <DeferredSiteChrome />
          </AdminUiProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
