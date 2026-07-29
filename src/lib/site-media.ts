/** Static media shipped in `public/images/site/` for production (Vercel has no local /media disk). */

export type StaticGalleryItem = {
  id: string;
  alt: string;
  url: string;
  mimeType: string;
};

export const staticFormationCovers: Record<string, string> = {
  "formation-jouer-face-camera": "/images/formations/formation-jouer-face-camera.jpg",
  "formation-tourner-bande-demo": "/images/formations/formation-bande-demo.jpg",
  "formation-realiser-film-court": "/images/formations/formation-realiser-court-metrage.jpg",
  "formation-ecriture-court-metrage": "/images/formations/formation-ecriture-scenario.jpg",
  "formation-lumiere-image": "/images/formations/formation-camera-cinema.jpg",
  "formation-passer-a-la-realisation": "/images/formations/formation-production-film.jpg",
};

/** Pool d'images plateau versionnées (public/images/formations) — hors /images/site gitignoré. */
const formationCoverFallbacks = [
  "/images/formations/formation-jouer-face-camera.jpg",
  "/images/formations/formation-bande-demo.jpg",
  "/images/formations/formation-realiser-court-metrage.jpg",
  "/images/formations/formation-ecriture-scenario.jpg",
  "/images/formations/formation-camera-cinema.jpg",
  "/images/formations/formation-production-film.jpg",
] as const;

function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return h;
}

function isDeployablePublicPath(url: string): boolean {
  // /images/site/* is gitignored and absent on Vercel
  return !url.startsWith("/images/site/");
}

/** Cover dédiée si connue, sinon image plateau de secours (stable par slug). */
export function resolveFormationCoverUrl(slug: string, explicit?: string | null): string {
  if (explicit && isDeployablePublicPath(explicit)) return explicit;
  if (staticFormationCovers[slug]) return staticFormationCovers[slug];
  return formationCoverFallbacks[hashSlug(slug) % formationCoverFallbacks.length];
}

export const staticIntervenantPhotos: Record<string, string> = {
  "bibi-naceri": "/images/site/intervenants/bibi-naceri.jpg",
  "salim-kechiouche": "/images/site/intervenants/salim-kechiouche.jpg",
  "edouard-montoute": "/images/site/intervenants/edouard-montoute.jpg",
  "karina-testa": "/images/site/intervenants/karina-testa.jpg",
};

export const staticFounderPhoto = "/images/site/founder/choukri-roua.jpg";

/** Fallback prod si la relation Payload est cassée (fichier versionné Git). */
export const staticFounderPhotoCommitted = "/images/founder/choukri-roua.jpg";

export const staticGalleryItems: StaticGalleryItem[] = [
  { id: "g01", alt: "Plateau de tournage — direction d'acteur", url: "/images/site/gallery/01.jpg", mimeType: "image/jpeg" },
  { id: "g02", alt: "Plateau Cinémergence — équipe technique", url: "/images/site/gallery/02.jpg", mimeType: "image/jpeg" },
  { id: "g03", alt: "Master class sur le plateau", url: "/images/site/gallery/03.jpg", mimeType: "image/jpeg" },
  { id: "g04", alt: "Tournage en conditions professionnelles", url: "/images/site/gallery/04.jpg", mimeType: "image/jpeg" },
  { id: "g05", alt: "Comédiens en répétition avant prise", url: "/images/site/gallery/05.jpg", mimeType: "image/jpeg" },
  { id: "g06", alt: "Plateau lumière cinéma", url: "/images/site/gallery/06.jpg", mimeType: "image/jpeg" },
  { id: "g07", alt: "Ambiance plateau Cinémergence", url: "/images/site/gallery/07.jpg", mimeType: "image/jpeg" },
  { id: "g08", alt: "Stagiaires sur le tournage", url: "/images/site/gallery/08.jpg", mimeType: "image/jpeg" },
  { id: "g09", alt: "Master class avec les intervenants", url: "/images/site/gallery/09.jpg", mimeType: "image/jpeg" },
  { id: "g10", alt: "Extrait plateau — tournage stage", url: "/images/site/gallery/10.mp4", mimeType: "video/mp4" },
  { id: "g11", alt: "Extrait plateau — mise en scène", url: "/images/site/gallery/11.mp4", mimeType: "video/mp4" },
  { id: "g12", alt: "Livrable stagiaire — scène tournée", url: "/images/site/gallery/12.mp4", mimeType: "video/mp4" },
];

export function getStaticCarouselItems(limit = 8): StaticGalleryItem[] {
  return staticGalleryItems
    .filter((item) => item.mimeType.startsWith("image/"))
    .slice(0, limit);
}
