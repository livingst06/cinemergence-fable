import type { Metadata } from "next";

import { MediaFrame } from "@/components/ui/MediaFrame";
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
            description="Moments capturés sur nos plateaux et livrables produits par les stagiaires."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {media.length > 0
              ? media.map((item) => (
                  <article key={String(item.id)} className="group card-stage overflow-hidden">
                    <MediaFrame
                      src={item.url}
                      mimeType={item.mimeType}
                      alt={item.alt}
                      aspect="video"
                      className="rounded-none border-0"
                    />
                    <div className="p-4">
                      <p className="text-sm font-medium text-cream">{item.alt}</p>
                      {item.caption && (
                        <p className="mt-1 text-xs text-muted-text">{item.caption}</p>
                      )}
                    </div>
                  </article>
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
