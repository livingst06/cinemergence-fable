import type { Metadata } from "next";

import { Section, SectionHeader } from "@/components/ui/Section";
import { IntervenantCard } from "@/features/intervenants/IntervenantCard";
import { getIntervenants, getSiteSettings } from "@/lib/data";

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
  const formateurs = intervenants.filter((i) => i.categorie === "formateur");

  return (
    <>
      <h1 className="sr-only">Intervenants</h1>
      <Section>
        <div className="container-page space-y-16 md:space-y-20">
          <div>
            <SectionHeader
              eyebrow="Guests"
              title={"Nos intervenants\u00a0professionnels"}
              description={
                <>
                  <p>Des talents du cinéma qui interviennent en masterclass et sur le plateau</p>
                  <p className="mt-1">pour un retour pro&nbsp;direct.</p>
                </>
              }
              className="mb-8 md:mb-10"
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {professionnels.map((i) => (
                <IntervenantCard key={i.slug} intervenant={i} />
              ))}
            </div>
          </div>

          {formateurs.length > 0 && (
            <div>
              <SectionHeader
                eyebrow="Pédagogie"
                title={"Nos formateurs\u00a0pédagogiques"}
                description={
                  <>
                    <p>L&apos;équipe qui encadre la progression au quotidien,</p>
                    <p className="mt-1">avec des retours concrets et&nbsp;suivis.</p>
                  </>
                }
                className="mb-8 md:mb-10"
              />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {formateurs.map((i) => (
                  <IntervenantCard key={i.slug} intervenant={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
