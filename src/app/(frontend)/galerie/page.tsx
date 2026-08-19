import type { Metadata } from "next";

import { GalleryGrid } from "@/features/galerie/GalleryGrid";
import { Placeholder } from "@/components/ui/Placeholder";
import { Section } from "@/components/ui/Section";
import { PageHero } from "@/components/sections/PageHero";
import { getGalleryMedia } from "@/lib/data";
import { isImageMimeType } from "@/lib/media-utils";
import { staticInterviewVideos } from "@/lib/site-media";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Galerie — Tournages et livrables",
  description:
    "Interviews d'élèves, photos et extraits des formations Cinémergence : plateaux de tournage et livrables.",
  alternates: { canonical: "/galerie" },
};

export default async function GaleriePage() {
  const media = await getGalleryMedia();
  const plateau = media.filter(
    (item) => item.url && isImageMimeType(item.mimeType, item.url),
  );

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
        title="Les interviews"
        description={
          <p className="text-pretty text-xl leading-relaxed md:text-2xl">
            Paroles d&apos;élèves, filmées pendant les formations
          </p>
        }
      >
        <div className="mt-8 max-w-4xl md:mt-10">
          <GalleryGrid items={staticInterviewVideos} compact />
        </div>
      </PageHero>
      <PageHero
        headingAs="h2"
        title="Sur le plateau"
        description={
          <p className="text-pretty text-xl leading-relaxed md:text-2xl">
            Moments capturés pendant nos sessions de formation
          </p>
        }
      />
      <Section className="pt-8 pb-20 md:pt-10 md:pb-28">
        <div className="container-page">
          {plateau.length > 0 ? (
            <GalleryGrid
              items={plateau.flatMap((item) =>
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
