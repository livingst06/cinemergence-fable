import type { Metadata } from "next";

import { Section } from "@/components/ui/Section";
import { PageHero } from "@/components/sections/PageHero";
import { IntervenantsAdmin } from "@/features/intervenants/IntervenantsAdmin";
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

  return (
    <>
      <PageHero
        eyebrow="Intervenants"
        title={"La légitimité\u00a0cinématographique"}
        description={
          <>
            <p>
              Des professionnels du cinéma qui transmettent leur exigence et leur passion sur le
              plateau.
            </p>
            <p className="mt-1">
              L&apos;intérêt : bénéficier d&apos;un retour pro direct, immédiat, pour progresser
              vraiment.
            </p>
          </>
        }
      />
      <Section className="pt-10 md:pt-12">
        <IntervenantsAdmin intervenants={intervenants} />
      </Section>
    </>
  );
}
