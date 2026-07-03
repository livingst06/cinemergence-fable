import type { Metadata } from "next";

import { Section } from "@/components/ui/Section";
import { PageHero } from "@/components/sections/PageHero";
import { IntervenantCard } from "@/features/intervenants/IntervenantCard";
import { getIntervenants, getSiteSettings } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return {
    title: "Intervenants — Professionnels du cinéma",
    description: `Les intervenants Cinémergence : acteurs et créateurs reconnus qui encadrent les formations à ${site.city}.`,
    alternates: { canonical: "/intervenants" },
  };
}

export default async function IntervenantsPage() {
  const intervenants = await getIntervenants();

  return (
    <>
      <PageHero
        eyebrow="Intervenants"
        title="La légitimité cinématographique"
        description="Des professionnels du cinéma qui transmettent leur exigence et leur passion sur le plateau."
      />
      <Section>
        <div className="container-page grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {intervenants.map((i) => (
            <IntervenantCard key={i.slug} intervenant={i} />
          ))}
        </div>
      </Section>
    </>
  );
}
