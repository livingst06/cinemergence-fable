import type { Payload } from "payload";

function mediaIdFrom(value: unknown): number | string | null {
  if (value == null) return null;
  if (typeof value === "number" || typeof value === "string") return value;
  if (typeof value === "object" && "id" in value) {
    const id = (value as { id?: number | string }).id;
    return id ?? null;
  }
  return null;
}

/** IDs media liés à une formation (cover + galerie). */
export function collectFormationMediaIds(doc: {
  coverImage?: unknown;
  images?: unknown;
}): Array<number | string> {
  const ids = new Set<string>();
  const out: Array<number | string> = [];

  const push = (raw: unknown) => {
    const id = mediaIdFrom(raw);
    if (id == null) return;
    const key = String(id);
    if (ids.has(key)) return;
    ids.add(key);
    out.push(id);
  };

  push(doc.coverImage);

  if (Array.isArray(doc.images)) {
    for (const row of doc.images) {
      if (!row || typeof row !== "object") continue;
      push((row as { image?: unknown }).image);
    }
  }

  return out;
}

export async function deleteMediaByIds(
  payload: Payload,
  ids: Array<number | string>,
): Promise<number> {
  let deleted = 0;
  for (const id of ids) {
    try {
      await payload.delete({
        collection: "media",
        id,
        overrideAccess: true,
      });
      deleted += 1;
    } catch (error) {
      console.error("[deleteMediaByIds]", id, error);
    }
  }
  return deleted;
}

/**
 * Supprime une formation. Les médias liés sont retirés via les hooks
 * `beforeDelete` / `afterDelete` de la collection Formations.
 */
export async function deleteFormationWithMedia(
  payload: Payload,
  formationId: number | string,
): Promise<void> {
  await payload.delete({
    collection: "formations",
    id: formationId,
    overrideAccess: true,
  });
}

/**
 * Nettoie les covers orphelines « Couverture — {slug} » dont la formation n'existe plus,
 * et les médias `formation` / `autre` non référencés (uploads admin orphelins).
 */
export async function cleanupOrphanFormationCovers(payload: Payload): Promise<number> {
  const formations = await payload.find({
    collection: "formations",
    limit: 500,
    depth: 0,
    overrideAccess: true,
  });
  const slugs = new Set(formations.docs.map((doc) => String(doc.slug)));

  const referenced = new Set<string>();
  for (const doc of formations.docs) {
    for (const id of collectFormationMediaIds(
      doc as { coverImage?: unknown; images?: unknown },
    )) {
      referenced.add(String(id));
    }
  }

  try {
    const intervenants = await payload.find({
      collection: "intervenants",
      limit: 100,
      depth: 0,
      overrideAccess: true,
    });
    for (const doc of intervenants.docs) {
      const id = mediaIdFrom(doc.photo);
      if (id != null) referenced.add(String(id));
    }
  } catch {
    // collection absente
  }

  try {
    const settings = await payload.findGlobal({
      slug: "site-settings",
      overrideAccess: true,
    });
    const founderId = mediaIdFrom(
      (settings as { founderPhoto?: unknown }).founderPhoto,
    );
    if (founderId != null) referenced.add(String(founderId));
  } catch {
    // global absent
  }

  const media = await payload.find({
    collection: "media",
    limit: 500,
    depth: 0,
    overrideAccess: true,
  });

  const orphanIds: Array<number | string> = [];
  for (const doc of media.docs) {
    const alt = typeof doc.alt === "string" ? doc.alt : "";
    const category = typeof doc.category === "string" ? doc.category : "";
    const match = /^Couverture\s+[—–-]\s+(.+)$/u.exec(alt.trim());
    if (match?.[1] && !slugs.has(match[1].trim())) {
      orphanIds.push(doc.id);
      continue;
    }
    if (
      (category === "formation" || category === "autre") &&
      !referenced.has(String(doc.id))
    ) {
      orphanIds.push(doc.id);
    }
  }

  return deleteMediaByIds(payload, orphanIds);
}
