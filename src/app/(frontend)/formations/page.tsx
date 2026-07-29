import type { Metadata } from "next";

import { Section, SectionHeader } from "@/components/ui/Section";
import { PageHero } from "@/components/sections/PageHero";
import { FormationsCatalog } from "@/features/formations/FormationsCatalog";
import { getFormations, getSiteSettings } from "@/lib/data";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return {
    title: "Nos formations cinéma",
    description: `Catalogue des formations de ${site.name}, école de formation cinéma à Paris.`,
    alternates: { canonical: "/formations" },
  };
}

export default async function FormationsIndexPage() {
  const formations = await getFormations();

  return (
    <>
      <PageHero
        eyebrow="Catalogue"
        title="Nos formations"
        description="Parcours professionnalisants pour comédiens, techniciens et entreprises — chacun avec un livrable clair pour le stagiaire."
      />
      <Section>
        <div className="container-page">
          <SectionHeader
            eyebrow="Choisir"
            title="Trouve ta formation"
            description="Filtre par pôle ou parcours toute l'offre."
            align="left"
            className="mb-10"
          />
          <FormationsCatalog formations={formations} />
        </div>
      </Section>
    </>
  );
}
