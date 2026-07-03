import type { Metadata } from "next";

import { Section } from "@/components/ui/Section";
import { PageHero } from "@/components/sections/PageHero";
import { LegalPageContent } from "@/features/legal/LegalPageContent";
import { defaultLegal } from "@/lib/defaults";

export const metadata: Metadata = {
  title: "Mentions légales",
  alternates: { canonical: "/mentions-legales" },
};

export default function MentionsLegalesPage() {
  return (
    <>
      <PageHero eyebrow="Légal" title="Mentions légales" />
      <Section>
        <div className="container-page max-w-3xl">
          <LegalPageContent title="Mentions légales" content={defaultLegal.mentionsLegales} />
        </div>
      </Section>
    </>
  );
}
