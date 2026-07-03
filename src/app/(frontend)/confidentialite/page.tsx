import type { Metadata } from "next";

import { Section } from "@/components/ui/Section";
import { PageHero } from "@/components/sections/PageHero";
import { LegalPageContent } from "@/features/legal/LegalPageContent";
import { defaultLegal } from "@/lib/defaults";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  alternates: { canonical: "/confidentialite" },
};

export default function ConfidentialitePage() {
  return (
    <>
      <PageHero eyebrow="Légal" title="Politique de confidentialité" />
      <Section>
        <div className="container-page max-w-3xl">
          <LegalPageContent title="Politique de confidentialité (RGPD)" content={defaultLegal.confidentialite} />
        </div>
      </Section>
    </>
  );
}
