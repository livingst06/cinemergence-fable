import { KHEIRON_MEDIA } from "@/features/kheiron/config";

export type TemoignageVideo = {
  src: string;
  poster: string;
  nom: string;
};

const img = (file: string) => `${KHEIRON_MEDIA}/images/${file}`;
const vid = (file: string) => `${KHEIRON_MEDIA}/videos/${file}`;

/** Les sept témoignages filmés, partagés par l'accueil et la page Kheiron. */
export const temoignageVideos: readonly TemoignageVideo[] = [
  { src: vid("temoignage-clement.mp4"), poster: img("temoignage-clement.webp"), nom: "Clément" },
  { src: vid("temoignage-chloe.mp4"), poster: img("temoignage-chloe.webp"), nom: "Chloé" },
  { src: vid("temoignage-maxime.mp4"), poster: img("temoignage-maxime.webp"), nom: "Maxime" },
  { src: vid("temoignage-klemence.mp4"), poster: img("temoignage-klemence.webp"), nom: "Klémence" },
  { src: vid("temoignage-caner.mp4"), poster: img("temoignage-caner.webp"), nom: "Caner" },
  { src: vid("temoignage-lea.mp4"), poster: img("temoignage-lea.webp"), nom: "Léa" },
  { src: vid("temoignage-jean.mp4"), poster: img("temoignage-jean.webp"), nom: "Jean" },
];

export const temoignageVideoCopy = {
  eyebrow: "Ils sont passés par Cinémergence",
  title: "Ce qu'en disent nos anciens élèves.",
  lead: "Ils ont suivi nos formations cinéma. Ils racontent avec leurs mots ce qui a changé pour eux. Chaque formation Cinémergence repose sur la même exigence : des professionnels du métier, des conditions réelles et un livrable concret à la fin.",
} as const;
