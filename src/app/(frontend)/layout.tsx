import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { DeferredSiteChrome } from "@/components/DeferredSiteChrome";
import { TagManager } from "@/components/TagManager";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SiteNoticeBanner } from "@/components/layout/SiteNoticeBanner";
import { Toaster } from "@/components/ui/sonner";
import { AdminUiProvider } from "@/features/admin/AdminUiContext";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { clerkAllowedRedirectOrigins } from "@/lib/clerk-origins";
import { getFormations, getSiteSettings } from "@/lib/data";
import { facebookDomainVerification, organizationJsonLd } from "@/lib/seo";
import { getSessionProfile } from "@/lib/session-profile";
import { socialMetadata } from "@/lib/share-metadata";
import { cn } from "@/lib/utils";

import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  axes: ["opsz"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const themeInitScript = `(function(){var r=document.documentElement;r.classList.add("dark");try{if(localStorage.getItem("cinemergence-notice")==="dismissed"){r.classList.add("site-notice-dismissed");}}catch(e){}document.addEventListener("change",function(e){if(e.target&&e.target.id==="site-notice-dismiss"){r.classList.add("site-notice-dismissed");try{localStorage.setItem("cinemergence-notice","dismissed")}catch(err){}}});})();`;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  const social = socialMetadata({ siteName: site.name });
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
      email: false,
      address: false,
      date: false,
    },
    openGraph: social.openGraph,
    twitter: social.twitter,
    other: facebookDomainVerification,
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
    <html
      lang="fr"
      className={cn(inter.variable, "dark min-h-dvh")}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="flex min-h-dvh flex-col overflow-x-clip">
        <TagManager />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
            <main className="flex-1 overflow-x-clip pt-[calc(var(--site-notice-h)+var(--site-header-h)+env(safe-area-inset-top,0px))]">
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
            <Toaster />
            <Analytics />
            <SpeedInsights />
          </AdminUiProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
