import fs from "fs";
import path from "path";

import { defaultIntervenants } from "@/lib/defaults";

const assetsRoot = path.resolve("_assets-client");

const slugAliases: Record<string, string[]> = {
  "bibi-naceri": ["bibi-naceri", "bibi naceri", "bibi_naceri", "naceri"],
  "salim-kechiouche": ["salim-kechiouche", "salim kechiouche", "salim_kechiouche", "kechiouche"],
  "edouard-montoute": [
    "edouard-montoute",
    "edouard montoute",
    "edouard_montoute",
    "montoute",
  ],
  "karina-testa": ["karina-testa", "karina testa", "karina_testa", "testa"],
};

/** Fallback when no filename match — portraits Cinémergence identifiés manuellement. */
export const intervenantPhotoFallbacks: Record<string, string> = {
  "bibi-naceri": "photos/portraits/bibi-naceri.jpeg",
  "salim-kechiouche": "photos/portraits/salim-kechiouche.jpeg",
  "edouard-montoute": "photos/portraits/edouard-montoute.jpeg",
  "karina-testa": "photos/portraits/karina-testa.jpeg",
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[_-]/g, " ");
}

function listPhotoFiles(dir: string, prefix = ""): string[] {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      return listPhotoFiles(absolute, relative);
    }

    if (!/\.(jpe?g|png|webp)$/i.test(entry.name)) return [];
    return [relative];
  });
}

function matchSlug(filename: string, slug: string): boolean {
  const normalizedName = normalize(path.parse(filename).name);
  const aliases = slugAliases[slug] ?? [slug];

  return aliases.some((alias) => {
    const normalizedAlias = normalize(alias);
    return (
      normalizedName === normalizedAlias ||
      normalizedName.includes(normalizedAlias) ||
      normalizedAlias.includes(normalizedName)
    );
  });
}

/** Resolve intervenant slug → `_assets-client/` relative path from filename tokens. */
export function discoverIntervenantPhotoPaths(): Record<string, string> {
  const searchRoots = [
    path.join(assetsRoot, "photos/portraits"),
    path.join(assetsRoot, "photos/intervenants"),
    path.join(assetsRoot, "photos"),
  ];

  const files = searchRoots.flatMap((dir) => {
    const prefix = path.relative(assetsRoot, dir);
    return listPhotoFiles(dir, prefix === "." ? "" : prefix).map((file) =>
      file.replace(/\\/g, "/"),
    );
  });

  const resolved: Record<string, string> = {};

  for (const { slug } of defaultIntervenants) {
    const match = files.find((file) => matchSlug(path.basename(file), slug));
    if (match) {
      resolved[slug] = match;
    }
  }

  return resolved;
}

export function getIntervenantPhotoPaths(): Record<string, string> {
  const discovered = discoverIntervenantPhotoPaths();
  const merged: Record<string, string> = {};

  for (const { slug } of defaultIntervenants) {
    const candidate = discovered[slug] ?? intervenantPhotoFallbacks[slug];
    if (candidate && fs.existsSync(path.join(assetsRoot, candidate))) {
      merged[slug] = candidate;
    }
  }

  return merged;
}
