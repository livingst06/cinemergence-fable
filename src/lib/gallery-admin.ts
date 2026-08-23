export const GALLERY_PLATEAU_CATEGORIES = ["plateau", "livrable"] as const;
export const GALLERY_INTERVIEW_CATEGORY = "interview" as const;
export const DEFAULT_GALLERY_PHOTO_ALT = "Photo plateau";
export const MAX_GALLERY_PHOTO_BATCH = 40;

export type GalleryPlateauCategory = (typeof GALLERY_PLATEAU_CATEGORIES)[number];
export type GalleryAdminCategory =
  | GalleryPlateauCategory
  | typeof GALLERY_INTERVIEW_CATEGORY;
