import type { Metadata } from "next";
import { Bebas_Neue, Inter, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";

import { Analytics } from "@/components/Analytics";
import { KheironConsent } from "@/features/kheiron/KheironConsent";

import "@/features/kheiron/kheiron.css";

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-k-sans",
  display: "swap",
});

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["700", "800"],
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

export const metadata: Metadata = {
  title: "Masterclass Stand-Up avec Kheiron — Cinémergence",
  description:
    "Formation stand-up de 4 jours à Paris : joue ton sketch devant Kheiron au Théâtre Apollo, réécris-le avec nos formateurs et termine par une scène ouverte filmée dans un café-théâtre. 28–29 novembre & 5–6 décembre 2026.",
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${sans.variable} ${display.variable} ${bebas.variable} ${serif.variable}`}>
      <body>
        {children}
        <KheironConsent />
        <Analytics />
      </body>
    </html>
  );
}
