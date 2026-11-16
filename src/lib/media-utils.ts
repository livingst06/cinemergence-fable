export type MediaRef = {
  url?: string | null;
  mimeType?: string | null;
  alt?: string | null;
};

export function resolveMediaUrl(media: unknown): string | undefined {
  if (!media || typeof media !== "object") return undefined;
  const url = (media as MediaRef).url;
  return url ?? undefined;
}

export function resolveMediaMimeType(media: unknown): string | undefined {
  if (!media || typeof media !== "object") return undefined;
  const mimeType = (media as MediaRef).mimeType;
  return mimeType ?? undefined;
}

export function isVideoMimeType(mimeType?: string): boolean {
  return Boolean(mimeType?.startsWith("video/"));
}

export function isImageMimeType(mimeType?: string, url?: string): boolean {
  if (mimeType?.startsWith("image/")) return true;
  if (url && /\.(jpe?g|png|webp|gif)(\?|$)/i.test(url)) return true;
  return !isVideoMimeType(mimeType);
}

export function isPersistedMediaUrl(url?: string | null): boolean {
  if (!url) return false;
  return /^https?:\/\//i.test(url);
}

/** URL d’un média CMS éditable (bucket ou fichier Payload). Les replis /images ne comptent pas. */
export function editableCmsPhotoUrl(media: unknown): string | undefined {
  const url = resolveMediaUrl(media);
  if (!url) return undefined;
  if (isPersistedMediaUrl(url) || url.startsWith("/api/media/")) return url;
  return undefined;
}

/** Remote URL, then Payload local path (/api/media/file/…), then optional static /public fallback. */
export function resolveDisplayMediaUrl(
  payloadMedia: unknown,
  staticFallback?: string,
): string | undefined {
  const url = resolveMediaUrl(payloadMedia);
  if (isPersistedMediaUrl(url)) return url;
  if (url) return url;
  return staticFallback ?? undefined;
}
