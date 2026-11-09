import type { Metadata } from "next";

import { KheironLanding } from "@/features/kheiron/KheironLanding";
import { defaultSite } from "@/lib/defaults";
import { getKheironOffer } from "@/lib/kheiron-checkout";
import { kheironShareImage, socialMetadata } from "@/lib/share-metadata";

export const dynamic = "force-dynamic";

const title = "Masterclass Stand-Up avec Kheiron — Cinémergence";
const description =
  "Formation stand-up de 4 jours à Paris : joue ton sketch devant Kheiron au Théâtre Apollo, réécris-le avec nos formateurs et termine par une scène ouverte filmée dans un café-théâtre. 28–29 novembre & 5–6 décembre 2026.";

const social = socialMetadata({
  title,
  description,
  url: `${defaultSite.url}/formations/kheiron`,
  image: kheironShareImage,
});

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${defaultSite.url}/formations/kheiron` },
  openGraph: social.openGraph,
  twitter: social.twitter,
};

export default async function KheironPage() {
  const offer = await getKheironOffer();
  // paidCount fixe le tarif et le complet. La page reçoit la phase et le lien.
  return (
    <KheironLanding
      offer={{ phase: offer.phase, paymentLink: offer.paymentLink }}
    />
  );
}
