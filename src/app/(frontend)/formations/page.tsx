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
    <div className="container-page py-12 md:py-16 lg:py-20">
      <header className="mb-10 max-w-4xl md:mb-12">
        <h1 className="display-title text-cream">Nos formations</h1>
        <p className="mt-5 text-base leading-relaxed text-muted-text md:text-lg">
          Parcours professionnalisants pour comédiens, techniciens et entreprises
          <br />
          chacun avec un livrable clair pour l'élève.
        </p>
      </header>

      <FormationsCatalog formations={formations} />
    </div>
  );
}
