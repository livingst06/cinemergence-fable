import type { CSSProperties } from "react";

import { formationsCatalog } from "@/lib/formations-catalog";

/**
 * Couleur de tuile d’une formation, dérivée de son nom.
 *
 * Un hash isolé colle des teintes (paradoxe des anniversaires) : maquillage
 * et film court tombaient à 5° d’écart, donc le même olive.
 *
 * Catalogue : teintes équiréparties, injective.
 *   1. normalisation (casse, accents, espaces) ;
 *   2. ordre par FNV-1a (mélange, pas l’alphabet) ;
 *   3. hue = (i + ½) × 360° / n  → écart min = 360° / n
 *      (15° pour 24, 10° pour 36).
 *
 * Titre hors catalogue (CMS) : angle d’or, recalé pour rester à l’écart
 * des teintes déjà prises — le cercle du catalogue ne bouge pas.
 *
 * Rendu OKLCH saturé : 10–15° suffisent à lire rouge / or / lime / teal / bleu.
 */

export type FormationPastel = {
  empty: string;
  fill: string;
  text: string;
  muted: string;
  emptyDark: string;
  fillDark: string;
  textDark: string;
  mutedDark: string;
};

/** 360° / φ² — pour placer un titre hors catalogue sans recouvrir les autres. */
const GOLDEN_ANGLE_DEG = 137.50776405003785;

export function normalizeFormationColorKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** FNV-1a 32 bits — avalanche uniforme, déterministe, sans crypto. */
export function fnv1a32(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function circularHueDistance(a: number, b: number): number {
  const delta = Math.abs(a - b) % 360;
  return Math.min(delta, 360 - delta);
}

let cachedCatalogKeys: string[] | null = null;

function catalogOrderedKeys(): string[] {
  if (!cachedCatalogKeys) {
    cachedCatalogKeys = [
      ...new Set(
        formationsCatalog.map((f) => normalizeFormationColorKey(f.titre)),
      ),
    ].sort((a, b) => {
      const delta = fnv1a32(a) - fnv1a32(b);
      return delta !== 0 ? delta : a.localeCompare(b, "fr");
    });
  }
  return cachedCatalogKeys;
}

function catalogHueAt(index: number, count: number): number {
  return ((index + 0.5) * 360) / count;
}

function hueForUnlistedKey(key: string, catalogHues: number[]): number {
  const minGap = Math.min(12, 180 / Math.max(catalogHues.length, 1));
  let hue = (fnv1a32(key) * GOLDEN_ANGLE_DEG) % 360;
  for (let step = 0; step < 48; step += 1) {
    if (catalogHues.every((h) => circularHueDistance(h, hue) >= minGap)) {
      return hue;
    }
    hue = (hue + GOLDEN_ANGLE_DEG) % 360;
  }
  return hue;
}

export function formationColorIndex(name: string): {
  index: number;
  count: number;
} {
  const key = normalizeFormationColorKey(name) || "formation";
  const ordered = catalogOrderedKeys();
  return { index: ordered.indexOf(key), count: ordered.length };
}

/** Teinte équirépartie sur le cercle pour le catalogue ; repli pour le CMS. */
export function hueForFormationName(name: string): number {
  const key = normalizeFormationColorKey(name) || "formation";
  const ordered = catalogOrderedKeys();
  const index = ordered.indexOf(key);
  if (index >= 0) {
    return catalogHueAt(index, ordered.length);
  }
  const catalogHues = ordered.map((_, i) => catalogHueAt(i, ordered.length));
  return hueForUnlistedKey(key, catalogHues);
}

function oklch(l: number, c: number, h: number, a?: number): string {
  const hue = ((h % 360) + 360) % 360;
  const value = `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${hue.toFixed(2)}`;
  return a == null ? `${value})` : `${value} / ${a})`;
}

/** Les jaunes/olives assombris virent au kaki : on les relève un peu. */
function darkLightness(hue: number): number {
  const dist = circularHueDistance(hue, 90);
  const boost = dist < 50 ? 0.05 * (1 - dist / 50) : 0;
  return 0.36 + boost;
}

export function pastelForFormationName(name: string): FormationPastel {
  const hue = hueForFormationName(name);
  const lDark = darkLightness(hue);
  const chroma = 0.14;

  return {
    empty: oklch(0.78, 0.1, hue, 0.88),
    fill: oklch(0.48, 0.17, hue, 0.95),
    text: oklch(0.22, 0.06, hue),
    muted: oklch(0.32, 0.05, hue),
    emptyDark: oklch(lDark, chroma, hue, 0.94),
    fillDark: oklch(Math.min(0.68, lDark + 0.16), 0.13, hue, 0.94),
    textDark: oklch(0.97, 0.015, hue),
    mutedDark: oklch(0.9, 0.03, hue),
  };
}

/** Titre canonique pour la couleur : slug Stripe → titre catalogue. */
export function formationColorName(
  titre: string,
  slug?: string | null,
): string {
  const fromSlug = slug
    ? formationsCatalog.find((f) => f.slug === slug)?.titre
    : undefined;
  if (fromSlug) return fromSlug;

  const trimmed = titre.trim();
  const asSlug = formationsCatalog.find((f) => f.slug === trimmed)?.titre;
  if (asSlug) return asSlug;

  return trimmed || "Formation";
}

export const FORMATION_TILE_CLASS =
  "formation-tile formation-ink dark:!bg-[var(--tile-empty-dark)]";

export const FORMATION_ROW_CLASS =
  "formation-ink dark:!bg-[var(--tile-empty-dark)] dark:[&>td]:!bg-[var(--tile-empty-dark)]";

export function formationTileStyle(name: string): CSSProperties {
  const pastel = pastelForFormationName(name);
  return {
    backgroundColor: pastel.empty,
    color: pastel.text,
    "--tile-empty-dark": pastel.emptyDark,
    "--tile-fill": pastel.fill,
    "--tile-fill-dark": pastel.fillDark,
    "--tile-text": pastel.text,
    "--tile-text-dark": pastel.textDark,
    "--tile-muted": pastel.mutedDark,
  } as CSSProperties;
}
