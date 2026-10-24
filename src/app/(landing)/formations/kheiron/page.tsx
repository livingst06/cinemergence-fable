import type { Metadata } from "next";

import { KheironLanding } from "@/features/kheiron/KheironLanding";
import { defaultSite } from "@/lib/defaults";

const title = "Masterclass Stand-Up avec Kheiron — Cinémergence";
const description =
  "Formation stand-up de 4 jours à Paris : joue ton sketch devant Kheiron au Théâtre Apollo, réécris-le avec nos formateurs et termine par une scène ouverte filmée dans un café-théâtre. 28–29 novembre & 5–6 décembre 2026.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${defaultSite.url}/formations/kheiron` },
  openGraph: { title, description, url: `${defaultSite.url}/formations/kheiron` },
};

export default function KheironPage() {
  return <KheironLanding />;
}
