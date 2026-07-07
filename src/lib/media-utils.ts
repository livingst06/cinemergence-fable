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
