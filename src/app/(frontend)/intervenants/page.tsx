import type { Metadata } from "next";

import { Section } from "@/components/ui/Section";
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
      <h1 className="sr-only">Intervenants</h1>
      <Section>
        <IntervenantsAdmin intervenants={intervenants} />
      </Section>
    </>
  );
}
