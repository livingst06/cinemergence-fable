import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Bebas_Neue, Plus_Jakarta_Sans } from "next/font/google";

import { Analytics } from "@/components/Analytics";
import { CookieBanner } from "@/components/CookieBanner";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Toaster } from "@/components/ui/sonner";
import { AdminUiProvider } from "@/features/admin/AdminUiContext";
import { getFormations, getSiteSettings } from "@/lib/data";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { getSessionProfile } from "@/lib/session-profile";
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

const themeInitScript = `(function(){var KEY="cinemergence-theme";var ID="cinemergence-theme-toggle";function apply(theme){document.documentElement.classList.toggle("dark",theme!=="light");try{localStorage.setItem(KEY,theme==="light"?"light":"dark");}catch(e){}var el=document.getElementById(ID);if(el)el.checked=theme!=="light";}try{var t=localStorage.getItem(KEY);apply(t==="light"?"light":"dark");}catch(e){apply("dark");}function syncInput(){var el=document.getElementById(ID);if(el)el.checked=document.documentElement.classList.contains("dark");}document.addEventListener("change",function(e){var t=e.target;if(!t||t.id!==ID)return;apply(t.checked?"dark":"light");},true);if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",syncInput);else syncInput();setTimeout(syncInput,0);setTimeout(syncInput,120);})();`;

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
  const [site, formations, profile] = await Promise.all([
    getSiteSettings(),
    getFormations(),
    getSessionProfile(),
  ]);
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
          <AdminUiProvider
            initialUserEmail={profile.email}
            initialIsAdminEligible={profile.isAdminEligible}
          >
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
                prioritaire: f.prioritaire,
              }))}
            />
            <CookieBanner />
            <Analytics />
            <Toaster />
          </AdminUiProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
