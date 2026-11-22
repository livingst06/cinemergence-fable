import "server-only";

import {
  cleanupOrphanFormationCovers,
  deleteFormationWithMedia,
} from "@/lib/formation-media";
import { getPayloadClient } from "@/lib/payload";

export type FormationWrite = {
  slug: string;
  titre: string;
  titreCourt: string;
  pole: string;
  accroche: string;
  duree: string;
  dureeHeures: number;
  dureeJours: number;
  format: string;
  tarif: string;
  tarifEuros: number;
  prioritaire: boolean;
  audience: "intermittent" | "entreprise";
  publicCible: string;
  livrable: string;
  images?: Array<string | number>;
};

function mediaFieldsFromImages(imageIds: Array<string | number>) {
  return {
    images: imageIds.map((id) => ({ image: id })),
    coverImage: imageIds[0] ?? null,
  };
}

function newFormationDoc(data: FormationWrite) {
  return {
    slug: data.slug,
    titre: data.titre,
    titreCourt: data.titreCourt,
    pole: data.pole,
    accroche: data.accroche,
    duree: data.duree,
    dureeHeures: data.dureeHeures,
    dureeJours: data.dureeJours,
    format: data.format,
    tarif: data.tarif.trim(),
    tarifEuros: data.tarifEuros,
    prioritaire: data.prioritaire,
    audience: data.audience,
    publicCible: data.publicCible,
    livrable: data.livrable,
    ...mediaFieldsFromImages(data.images ?? []),
    intro: data.accroche,
    pourQui: data.publicCible,
    objectifs: [{ item: "À compléter dans l’admin Payload" }],
    programme: [{ titre: "Programme à compléter", detail: "Édition complète dans /admin" }],
    metaTitle: data.titre,
    metaDescription: data.accroche.slice(0, 160),
  };
}

export async function formationSlugTaken(slug: string): Promise<boolean> {
  const payload = await getPayloadClient();
  const existing = await payload.find({
    collection: "formations",
    where: { slug: { equals: slug } },
    limit: 1,
  });
  return Boolean(existing.docs[0]);
}

export async function insertFormation(data: FormationWrite): Promise<void> {
  const payload = await getPayloadClient();
  await payload.create({
    collection: "formations",
    data: newFormationDoc(data),
    overrideAccess: true,
  });
}

export async function updateFormationEssentials(
  id: number | string,
  data: FormationWrite,
): Promise<void> {
  const payload = await getPayloadClient();
  const current = await payload.findByID({
    collection: "formations",
    id,
    depth: 0,
  });
  await payload.update({
    collection: "formations",
    id,
    data: {
      slug: data.slug,
      titre: data.titre,
      titreCourt: data.titreCourt,
      pole: data.pole,
      accroche: data.accroche,
      duree: data.duree,
      dureeHeures: data.dureeHeures,
      dureeJours: data.dureeJours,
      format: data.format,
      tarif: data.tarif.trim(),
      tarifEuros: data.tarifEuros,
      prioritaire: data.prioritaire,
      audience: data.audience,
      publicCible: data.publicCible,
      livrable: data.livrable,
      ...mediaFieldsFromImages(data.images ?? []),
      metaTitle: current.metaTitle || data.titre,
      metaDescription: current.metaDescription || data.accroche.slice(0, 160),
    },
    overrideAccess: true,
  });
}

export async function deleteFormationRecord(id: number | string): Promise<void> {
  const payload = await getPayloadClient();
  await deleteFormationWithMedia(payload, id);
  await cleanupOrphanFormationCovers(payload);
}
