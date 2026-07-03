import type { Metadata } from "next";

import { Section } from "@/components/ui/Section";
import { PageHero } from "@/components/sections/PageHero";
import { LegalPageContent } from "@/features/legal/LegalPageContent";
import { defaultLegal } from "@/lib/defaults";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  alternates: { canonical: "/cgv" },
};

export default function CgvPage() {
  return (
    <>
      <PageHero eyebrow="Légal" title="Conditions générales de vente" />
      <Section>
        <div className="container-page max-w-3xl">
          <LegalPageContent title="CGV" content={defaultLegal.cgv} />
        </div>
      </Section>
    </>
  );
}
