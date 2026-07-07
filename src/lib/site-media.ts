/** Static media shipped in `public/images/site/` for production (Vercel has no local /media disk). */

export type StaticGalleryItem = {
  id: string;
  alt: string;
  url: string;
  mimeType: string;
};

export const staticFormationCovers: Record<string, string> = {
  "formation-jouer-face-camera": "/images/site/formations/formation-jouer-face-camera.jpg",
  "formation-realiser-court-metrage": "/images/site/formations/formation-realiser-court-metrage.jpg",
  "formation-ecriture-scenario": "/images/site/formations/formation-ecriture-scenario.jpg",
  "formation-bande-demo": "/images/site/formations/formation-bande-demo.jpg",
  "formation-camera-cinema": "/images/site/formations/formation-camera-cinema.jpg",
  "formation-production-film": "/images/site/formations/formation-production-film.jpg",
};

export const staticIntervenantPhotos: Record<string, string> = {
  "bibi-naceri": "/images/site/intervenants/bibi-naceri.jpg",
  "salim-kechiouche": "/images/site/intervenants/salim-kechiouche.jpg",
  "edouard-montoute": "/images/site/intervenants/edouard-montoute.jpg",
  "karina-testa": "/images/site/intervenants/karina-testa.jpg",
};

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
