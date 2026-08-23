import { validateAdminImageFile } from "@/lib/admin-image-upload";

export const ADMIN_GALLERY_VIDEO_MAX_BYTES = 2 * 1024 * 1024 * 1024;

export const ADMIN_GALLERY_VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

export type GalleryUploadValidation =
  | { ok: true; kind: "image" | "video"; mime: string }
  | { ok: false; error: string };

export function extForGalleryMime(mime: string): string {
  switch (mime) {
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/heic":
    case "image/heif":
      return ".heic";
    case "video/webm":
      return ".webm";
    case "video/quicktime":
      return ".mov";
    case "video/mp4":
      return ".mp4";
    default:
      return ".jpg";
  }
}

export function validateAdminGalleryFile(file: {
  type: string;
  size: number;
}): GalleryUploadValidation {
  const mime = (file.type || "application/octet-stream").toLowerCase();

  if (ADMIN_GALLERY_VIDEO_MIME_TYPES.has(mime)) {
    if (file.size <= 0 || file.size > ADMIN_GALLERY_VIDEO_MAX_BYTES) {
      return { ok: false, error: "Vidéo trop volumineuse (max 2 Go)" };
    }
    return { ok: true, kind: "video", mime };
  }

  const image = validateAdminImageFile(file);
  if (!image.ok) return image;
  return { ok: true, kind: "image", mime: image.mime };
}

export function partitionAdminGalleryImages<T extends { type: string; size: number }>(
  files: T[],
): { accepted: T[]; rejectedCount: number } {
  const accepted: T[] = [];
  let rejectedCount = 0;
  for (const file of files) {
    if (validateAdminImageFile(file).ok) accepted.push(file);
    else rejectedCount += 1;
  }
  return { accepted, rejectedCount };
}
