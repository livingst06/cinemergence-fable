/**
 * Media URLs for the public site.
 * Production covers live in the public Supabase bucket `cinemergence-media`.
 * Local `/images/site/*` remains gitignored (sync:media only).
 */

export type StaticGalleryItem = {
  id: string;
  alt: string;
  url: string;
  mimeType: string;
};

/** Public base URL of the Supabase Storage bucket (no trailing slash). */
export const SUPABASE_MEDIA_PUBLIC_BASE =
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PUBLIC_URL?.replace(/\/$/, "") ||
  process.env.SUPABASE_STORAGE_PUBLIC_URL?.replace(/\/$/, "") ||
  "https://vbazsgvvxjfodgtpgobf.supabase.co/storage/v1/object/public/cinemergence-media";

function supabaseMediaUrl(objectKey: string): string {
  const key = objectKey.replace(/^\//, "");
  return `${SUPABASE_MEDIA_PUBLIC_BASE}/${key}`;
}

const cover = (filename: string) => supabaseMediaUrl(`media/covers/${filename}`);

export const staticFormationCovers: Record<string, string> = {
  "formation-jouer-face-camera": cover("formation-jouer-face-camera.jpg"),
  "formation-tourner-bande-demo": cover("formation-bande-demo.jpg"),
  "formation-realiser-film-court": cover("formation-realiser-court-metrage.jpg"),
  "formation-ecriture-court-metrage": cover("formation-ecriture-scenario.jpg"),
  "formation-lumiere-image": cover("formation-camera-cinema.jpg"),
  "formation-passer-a-la-realisation": cover("formation-production-film.jpg"),
};

/** Pool de covers Supabase pour les formations sans image dédiée. */
const formationCoverFallbacks = [
  cover("formation-jouer-face-camera.jpg"),
  cover("formation-bande-demo.jpg"),
  cover("formation-realiser-court-metrage.jpg"),
  cover("formation-ecriture-scenario.jpg"),
  cover("formation-camera-cinema.jpg"),
  cover("formation-production-film.jpg"),
] as const;

/** Photos placeholder (6 visuels plateau) — à remplacer par des clichés par formation. */
const formationSessionPhotos: StaticGalleryItem[] = [
  {
    id: "fs-01",
    alt: "Session de formation — jeu face caméra",
    url: "/images/formations/formation-jouer-face-camera.jpg",
    mimeType: "image/jpeg",
  },
  {
    id: "fs-02",
    alt: "Session de formation — bande démo",
    url: "/images/formations/formation-bande-demo.jpg",
    mimeType: "image/jpeg",
  },
  {
    id: "fs-03",
    alt: "Session de formation — court métrage",
    url: "/images/formations/formation-realiser-court-metrage.jpg",
    mimeType: "image/jpeg",
  },
  {
    id: "fs-04",
    alt: "Session de formation — écriture de scénario",
    url: "/images/formations/formation-ecriture-scenario.jpg",
    mimeType: "image/jpeg",
  },
  {
    id: "fs-05",
    alt: "Session de formation — lumière et caméra",
    url: "/images/formations/formation-camera-cinema.jpg",
    mimeType: "image/jpeg",
  },
  {
    id: "fs-06",
    alt: "Session de formation — production",
    url: "/images/formations/formation-production-film.jpg",
    mimeType: "image/jpeg",
  },
];

/** Six photos de session, ordre stable et distinct par slug. */
export function getFormationPlaceholderGallery(
  slug: string,
  count = 6,
): StaticGalleryItem[] {
  const start = hashSlug(slug) % formationSessionPhotos.length;
  const rotated = [
    ...formationSessionPhotos.slice(start),
    ...formationSessionPhotos.slice(0, start),
  ];
  return rotated.slice(0, count).map((item) => ({
    ...item,
    id: `${slug}-${item.id}`,
  }));
}

function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return h;
}

function isUsableCoverUrl(url: string): boolean {
  if (!url) return false;
  // Local-only paths — never on Vercel
  if (url.startsWith("/images/site/")) return false;
  return true;
}

/** Cover dédiée si connue, sinon image plateau de secours (stable par slug). */
export function resolveFormationCoverUrl(slug: string, explicit?: string | null): string {
  if (explicit && isUsableCoverUrl(explicit)) {
    // Prefer Supabase / absolute URLs; allow remaining /images/formations during transition
    return explicit;
  }
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

/** Fallback prod — même fichier hébergé sur Supabase. */
export const staticFounderPhotoCommitted = cover("founder-choukri-roua.jpg");

export const staticGalleryItems: StaticGalleryItem[] = [
  { id: "g01", alt: "Plateau de tournage — direction d'acteur", url: "/images/site/gallery/01.jpg", mimeType: "image/jpeg" },
  { id: "g02", alt: "Plateau Cinémergence — équipe technique", url: "/images/site/gallery/02.jpg", mimeType: "image/jpeg" },
  { id: "g03", alt: "Master class sur le plateau", url: "/images/site/gallery/03.jpg", mimeType: "image/jpeg" },
  { id: "g04", alt: "Tournage en conditions professionnelles", url: "/images/site/gallery/04.jpg", mimeType: "image/jpeg" },
  { id: "g05", alt: "Comédiens en répétition avant prise", url: "/images/site/gallery/05.jpg", mimeType: "image/jpeg" },
  { id: "g06", alt: "Plateau lumière cinéma", url: "/images/site/gallery/06.jpg", mimeType: "image/jpeg" },
  { id: "g07", alt: "Ambiance plateau Cinémergence", url: "/images/site/gallery/07.jpg", mimeType: "image/jpeg" },
  { id: "g08", alt: "Élèves sur le tournage", url: "/images/site/gallery/08.jpg", mimeType: "image/jpeg" },
  { id: "g09", alt: "Master class avec les intervenants", url: "/images/site/gallery/09.jpg", mimeType: "image/jpeg" },
  { id: "g10", alt: "Extrait plateau — tournage stage", url: "/images/site/gallery/10.mp4", mimeType: "video/mp4" },
  { id: "g11", alt: "Extrait plateau — mise en scène", url: "/images/site/gallery/11.mp4", mimeType: "video/mp4" },
  { id: "g12", alt: "Livrable élève — scène tournée", url: "/images/site/gallery/12.mp4", mimeType: "video/mp4" },
];

export function getStaticCarouselItems(limit = 8): StaticGalleryItem[] {
  return staticGalleryItems
    .filter((item) => item.mimeType.startsWith("image/"))
    .slice(0, limit);
}
