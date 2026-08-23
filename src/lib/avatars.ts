/**
 * Palette d’avatars (30). Illustrations Avataaars via DiceBear —
 * style cartoon le plus répandu sur le web (Pablo Stanley, usage perso/commercial).
 * Fichiers vendored dans /public/avatars pour ne pas dépendre d’une API externe.
 */
export const AVATAR_KEYS = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
  "29",
  "30",
] as const;

export type AvatarKey = (typeof AVATAR_KEYS)[number];

export function isAvatarKey(value: string | null | undefined): value is AvatarKey {
  return Boolean(value && (AVATAR_KEYS as readonly string[]).includes(value));
}

export function avatarSrc(key: string | null | undefined): string | null {
  if (!isAvatarKey(key)) return null;
  return `/avatars/${key}.svg`;
}
