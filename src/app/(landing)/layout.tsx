import type { Metadata } from "next";
import { Bebas_Neue, Inter, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";

import { TagManager } from "@/components/TagManager";
import { KheironConsent } from "@/features/kheiron/KheironConsent";
import { facebookDomainVerification } from "@/lib/seo";
import { kheironShareImage, socialMetadata } from "@/lib/share-metadata";
import { getPublicSiteUrl } from "@/lib/site-url";

import "@/features/kheiron/kheiron.css";

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-k-sans",
  display: "swap",
});

const display = localFont({
  src: [
    {
      path: "../../fonts/plus-jakarta-sans/plus-jakarta-sans-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../fonts/plus-jakarta-sans/plus-jakarta-sans-latin-800-normal.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-k-display",
  display: "swap",
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-k-bebas",
  display: "swap",
});

const serif = Playfair_Display({
  subsets: ["latin"],
  weight: "600",
  style: "italic",
  variable: "--font-k-serif",
  display: "swap",
});

const social = socialMetadata({ image: kheironShareImage });

export const metadata: Metadata = {
  metadataBase: new URL(getPublicSiteUrl()),
  title: "Masterclass Stand-Up avec Kheiron — Cinémergence",
  description:
    "Formation stand-up de 4 jours à Paris : joue ton sketch devant Kheiron au Théâtre Apollo, réécris-le avec nos formateurs et termine par une scène ouverte filmée dans un café-théâtre. 28–29 novembre & 5–6 décembre 2026.",
  openGraph: social.openGraph,
  twitter: social.twitter,
  other: facebookDomainVerification,
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${sans.variable} ${display.variable} ${bebas.variable} ${serif.variable}`}>
      <body>
        <TagManager />
        {children}
        <KheironConsent />
      </body>
    </html>
  );
}
