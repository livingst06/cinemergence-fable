import type { Metadata } from "next";

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
    <div className="container-page py-10 sm:py-12 md:py-16 lg:py-20">
      <header className="mb-8 max-w-4xl sm:mb-10 md:mb-12">
        <p className="eyebrow mb-3 md:mb-4">Catalogue</p>
        <h1 className="display-title text-cream">Nos formations</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-text md:mt-5 md:text-lg">
          Parcours professionnalisants pour comédiens, techniciens et entreprises
          <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>
          chacun avec un livrable clair pour le&nbsp;stagiaire.
        </p>
      </header>

      <FormationsCatalog formations={formations} />
    </div>
  );
}
