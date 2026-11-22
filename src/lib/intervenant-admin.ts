import "server-only";

import { deleteMediaByIds } from "@/lib/formation-media";
import { getPayloadClient } from "@/lib/payload";

export type IntervenantWrite = {
  slug: string;
  nom: string;
  role: string;
  email: string | null;
  categorie: "professionnel" | "formateur";
  parrain: boolean;
  bio: string;
  filmographie: string[];
  photoId?: string | number | null;
};

function filmographieRows(titres: string[]) {
  return titres
    .map((titre) => titre.trim())
    .filter(Boolean)
    .map((titre) => ({ titre }));
}

function documentFrom(data: IntervenantWrite) {
  const email =
    typeof data.email === "string" && data.email.trim() ? data.email.trim() : null;
  return {
    slug: data.slug,
    nom: data.nom,
    role: data.role,
    email,
    categorie: data.categorie,
    parrain: data.parrain,
    bio: data.bio,
    filmographie: filmographieRows(data.filmographie ?? []),
    photo: data.photoId ?? null,
  };
}

function mediaIdFrom(value: unknown): number | string | null {
  if (value == null) return null;
  if (typeof value === "number" || typeof value === "string") return value;
  if (typeof value === "object" && "id" in value) {
    const id = (value as { id?: number | string }).id;
    return id ?? null;
  }
  return null;
}

export async function intervenantSlugTaken(
  slug: string,
  exceptId?: number | string,
): Promise<boolean> {
  const payload = await getPayloadClient();
  const existing = await payload.find({
    collection: "intervenants",
    where: exceptId
      ? { and: [{ slug: { equals: slug } }, { id: { not_equals: exceptId } }] }
      : { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  return Boolean(existing.docs[0]);
}

export async function insertIntervenant(data: IntervenantWrite): Promise<number | string> {
  const payload = await getPayloadClient();
  const created = await payload.create({
    collection: "intervenants",
    data: documentFrom(data),
    overrideAccess: true,
  });
  return created.id;
}

export async function updateIntervenant(
  id: number | string,
  data: IntervenantWrite,
): Promise<void> {
  const payload = await getPayloadClient();
  const existing = await payload.findByID({
    collection: "intervenants",
    id,
    depth: 0,
    overrideAccess: true,
  });
  const previousPhotoId = mediaIdFrom(existing.photo);
  const nextPhotoId = data.photoId ?? null;
  await payload.update({
    collection: "intervenants",
    id,
    data: documentFrom(data),
    overrideAccess: true,
  });
  if (previousPhotoId != null && String(previousPhotoId) !== String(nextPhotoId ?? "")) {
    await deleteMediaByIds(payload, [previousPhotoId]);
  }
}

export async function intervenantLinkedToFormation(
  intervenantId: number | string,
): Promise<boolean> {
  const payload = await getPayloadClient();
  const idStr = String(intervenantId);
  const result = await payload.find({
    collection: "formations",
    limit: 500,
    depth: 0,
    overrideAccess: true,
  });
  for (const formation of result.docs) {
    const list = (formation as { intervenants?: unknown }).intervenants;
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      const id =
        typeof item === "object" && item && "id" in item
          ? String((item as { id: number | string }).id)
          : String(item);
      if (id === idStr) return true;
    }
  }
  return false;
}

export async function deleteIntervenant(id: number | string): Promise<void> {
  const payload = await getPayloadClient();
  const existing = await payload.findByID({
    collection: "intervenants",
    id,
    depth: 0,
    overrideAccess: true,
  });
  const photoId = mediaIdFrom(existing.photo);
  await payload.delete({
    collection: "intervenants",
    id,
    overrideAccess: true,
  });
  if (photoId != null) {
    await deleteMediaByIds(payload, [photoId]);
  }
}
