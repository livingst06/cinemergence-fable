/**
 * Plus grand côté — 720p. Assez net dans une lightbox desktop, taillé pour le
 * téléphone (la plupart des vues). Pas de 1080p : trop lourd pour le mobile.
 */
export const ADMIN_VIDEO_MAX_EDGE = 1280;
/** Qualité visuelle 0–1 (medium) : desktop lisible, fichier léger. */
export const ADMIN_VIDEO_QUALITY = 0.55;
/** Voix un peu plus soignée que l’image. */
export const ADMIN_AUDIO_QUALITY = 0.6;
/** Plafond fps — 60 fps n’apporte rien sur une interview web. */
export const ADMIN_VIDEO_MAX_FPS = 30;
export const OPTIMIZED_VIDEO_MIME = "video/mp4" as const;
export const OPTIMIZED_VIDEO_EXT = ".mp4" as const;

export type AdminVideoSize = {
  width: number;
  height: number;
};

function even(value: number): number {
  return Math.max(2, Math.floor(value / 2) * 2);
}

/**
 * Fit inside 1280×1280 without letterboxing (same idea as Sharp `fit: "inside"`).
 */
export function fitAdminVideoSize(width: number, height: number): AdminVideoSize {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) {
    return { width: 2, height: 2 };
  }
  const long = Math.max(width, height);
  const scale = long > ADMIN_VIDEO_MAX_EDGE ? ADMIN_VIDEO_MAX_EDGE / long : 1;
  return {
    width: even(width * scale),
    height: even(height * scale),
  };
}

export function interviewVideoOptimizeError(
  reason:
    | "undecodable_source_codec"
    | "no_encodable_target_codec"
    | "unknown_source_codec"
    | string,
): string {
  switch (reason) {
    case "undecodable_source_codec":
      return "Cette vidéo n’est pas lisible dans ce navigateur.";
    case "no_encodable_target_codec":
      return "Ce navigateur ne peut pas compresser la vidéo (essaie Chrome, Edge ou Safari).";
    case "unknown_source_codec":
      return "Format vidéo non reconnu.";
    default:
      return "Optimisation vidéo impossible.";
  }
}
