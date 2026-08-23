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
  poster?: string;
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

/** Ordre stable et distinct par slug — mêmes médias CMS, départ décalé. */
export function rotateItemsBySlug<T>(items: T[], slug: string): T[] {
  if (items.length === 0) return items;
  const start = hashSlug(slug) % items.length;
  return [...items.slice(start), ...items.slice(0, start)];
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

/**
 * Interviews élèves — 3 extraits dans le bucket `cinemergence-media`.
 * Source de seed CMS uniquement (affichage public = documents Payload `media`).
 */
export const staticInterviewVideos: StaticGalleryItem[] = [
  {
    id: "interview-01",
    alt: "Interview élève — témoignage de formation",
    url: supabaseMediaUrl("media/cinemergence-96c719ff-cbb6-42b9-8db0-3c0dc6560dc6.mp4"),
    mimeType: "video/mp4",
  },
  {
    id: "interview-02",
    alt: "Interview élève — retour d'expérience",
    url: supabaseMediaUrl("media/cinemergence-84e813d8-89d7-46a1-a4dc-c3afd79a8945.mp4"),
    mimeType: "video/mp4",
  },
  {
    id: "interview-03",
    alt: "Interview élève — sur le plateau",
    url: supabaseMediaUrl("media/cinemergence-4e3cb254-3c44-49d2-a069-bdd6c7eeed1c.mp4"),
    mimeType: "video/mp4",
  },
];
