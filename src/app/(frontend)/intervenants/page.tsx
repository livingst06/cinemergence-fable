import type { Metadata } from "next";

import { Section, SectionHeader } from "@/components/ui/Section";
import { IntervenantCard } from "@/features/intervenants/IntervenantCard";
import { getIntervenants, getSiteSettings } from "@/lib/data";
import { publicFormateurSlugs } from "@/lib/defaults";

export const revalidate = 300;

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
  const professionnels = intervenants.filter(
    (i) => (i.categorie ?? "professionnel") === "professionnel" && i.slug !== "karina-testa",
  );
  const formateurs = publicFormateurSlugs
    .map((slug) => intervenants.find((i) => i.slug === slug))
    .filter((i) => i != null);

  return (
    <>
      <h1 className="sr-only">Intervenants</h1>
      <Section>
        <div className="container-page">
          <SectionHeader
            title={"Nos intervenants\u00a0professionnels"}
            align="left"
            description={
              <>
                <p>Des talents du cinéma qui interviennent en masterclass et sur le plateau</p>
                <p className="mt-1">pour un retour pro&nbsp;direct.</p>
              </>
            }
            className="mb-8 md:mb-10"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {professionnels.map((i) => (
              <IntervenantCard key={i.slug} compact intervenant={i} />
            ))}
          </div>
        </div>
      </Section>
      {formateurs.length > 0 && (
        <Section>
          <div className="container-page">
            <SectionHeader
              title="Les formateurs"
              align="left"
              description="Ils accompagnent les élèves sur toute la formation."
              className="mb-8 md:mb-10"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {formateurs.map((i) => (
                <IntervenantCard key={i.slug} compact intervenant={i} />
              ))}
            </div>
          </div>
        </Section>
      )}
    </>
  );
}
