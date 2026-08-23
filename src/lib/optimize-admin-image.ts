import sharp from "sharp";

/** Plus grand côté conservé — assez pour lightbox, trop petit pour un RAW appareil. */
export const ADMIN_IMAGE_MAX_EDGE = 1920;
export const ADMIN_IMAGE_JPEG_QUALITY = 80;
export const OPTIMIZED_IMAGE_MIME = "image/jpeg" as const;
export const OPTIMIZED_IMAGE_EXT = ".jpg" as const;

export type OptimizedAdminImage = {
  buffer: Buffer;
  mime: typeof OPTIMIZED_IMAGE_MIME;
  ext: typeof OPTIMIZED_IMAGE_EXT;
  width: number;
  height: number;
};

/**
 * Normalise une photo admin avant enregistrement CMS :
 * orientation EXIF, max 1920px, JPEG mozjpeg progressif.
 */
export async function optimizeAdminImage(input: Buffer): Promise<OptimizedAdminImage> {
  try {
    const { data, info } = await sharp(input, { failOn: "none" })
      .rotate()
      .resize(ADMIN_IMAGE_MAX_EDGE, ADMIN_IMAGE_MAX_EDGE, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({
        quality: ADMIN_IMAGE_JPEG_QUALITY,
        mozjpeg: true,
        progressive: true,
      })
      .toBuffer({ resolveWithObject: true });

    if (!data.length || !info.width || !info.height) {
      throw new Error("empty");
    }

    return {
      buffer: data,
      mime: OPTIMIZED_IMAGE_MIME,
      ext: OPTIMIZED_IMAGE_EXT,
      width: info.width,
      height: info.height,
    };
  } catch {
    throw new Error(
      "Image illisible ou format non optimisable (essaie jpeg, png ou webp)",
    );
  }
}
