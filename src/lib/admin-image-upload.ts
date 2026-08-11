/** Shared image upload validation (admin media routes). */

export const ADMIN_IMAGE_MAX_BYTES = 8 * 1024 * 1024;

export const ADMIN_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export function extForImageMime(mime: string): string {
  switch (mime) {
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/heic":
    case "image/heif":
      return ".heic";
    default:
      return ".jpg";
  }
}

export type ImageUploadValidation =
  | { ok: true; mime: string }
  | { ok: false; error: string };

export function validateAdminImageFile(file: {
  type: string;
  size: number;
}): ImageUploadValidation {
  if (file.size <= 0 || file.size > ADMIN_IMAGE_MAX_BYTES) {
    return { ok: false, error: "Fichier trop volumineux (max 8 Mo)" };
  }

  const mime = (file.type || "application/octet-stream").toLowerCase();
  if (!ADMIN_IMAGE_MIME_TYPES.has(mime)) {
    return { ok: false, error: "Type d'image non supporté" };
  }

  return { ok: true, mime };
}
