import type { Metadata } from "next";

import { GalleryGrid } from "@/features/galerie/GalleryGrid";
import { Placeholder } from "@/components/ui/Placeholder";
import { Section, SectionHeader } from "@/components/ui/Section";
import { PageHero } from "@/components/sections/PageHero";
import { getGalleryMedia } from "@/lib/data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Galerie — Tournages et livrables",
  description:
    "Photos et vidéos des formations Cinémergence : plateaux de tournage et livrables des élèves.",
  alternates: { canonical: "/galerie" },
};

export default async function GaleriePage() {
  const media = await getGalleryMedia();

  const placeholders = [
    "Plateau de tournage — Formation",
    "Livrable élève — Court-métrage",
    "Plateau — Jeu d'acteur face caméra",
    "Livrable élève — Bande démo",
    "Plateau — Caméra cinéma pro",
    "Livrable élève — Scènes tournées",
  ];

  return (
    <>
      <PageHero
        eyebrow="Médias"
        title="Sur le plateau"
        description="Tournages et livrables produits par nos élèves."
      />
      <Section>
        <div className="container-page">
          <SectionHeader
            eyebrow="Galerie"
            title="Images des formations"
            description="Moments capturés sur nos plateaux et livrables produits par les élèves."
          />
          {media.length > 0 ? (
            <GalleryGrid
              items={media.flatMap((item) =>
                item.url
                  ? [
                      {
                        id: String(item.id),
                        alt: item.alt,
                        url: item.url,
                        mimeType: item.mimeType,
                      },
                    ]
                  : [],
              )}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {placeholders.map((label) => (
                <Placeholder key={label} label={label} aspect="video" hideLabel />
              ))}
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
