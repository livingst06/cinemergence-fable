import type { Metadata } from "next";

import { Placeholder } from "@/components/ui/Placeholder";
import { Section, SectionHeader } from "@/components/ui/Section";
import { PageHero } from "@/components/sections/PageHero";
import { getGalleryMedia } from "@/lib/data";

export const metadata: Metadata = {
  title: "Galerie — Tournages et livrables",
  description:
    "Photos et vidéos des stages Cinémergence : plateaux de tournage, master classes et livrables des stagiaires.",
  alternates: { canonical: "/galerie" },
};

export default async function GaleriePage() {
  const media = await getGalleryMedia();

  const placeholders = [
    "Plateau de tournage — Master class",
    "Livrable stagiaire — Court-métrage",
    "Plateau — Jeu d'acteur face caméra",
    "Livrable stagiaire — Bande démo",
    "Plateau — Caméra cinéma pro",
    "Livrable stagiaire — Scènes tournées",
  ];

  return (
    <>
      <PageHero
        eyebrow="Médias"
        title="Sur le plateau"
        description="Tournages, master classes et livrables produits par nos stagiaires."
      />
      <Section>
        <div className="container-page">
          <SectionHeader
            eyebrow="Galerie"
            title="Images des stages"
            description="Contenus administrables via Payload CMS. Placeholders en attendant les visuels validés."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {media.length > 0
              ? media.map((item) => (
                  <Placeholder
                    key={String(item.id)}
                    label={String(item.alt ?? "Média")}
                    aspect="video"
                  />
                ))
              : placeholders.map((label) => (
                  <Placeholder key={label} label={label} aspect="video" />
                ))}
          </div>
        </div>
      </Section>
    </>
  );
}
