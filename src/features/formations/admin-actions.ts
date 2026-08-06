"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/session-profile";
import { getPayloadClient } from "@/lib/payload";

const formationAdminSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "Slug requis")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalide (minuscules, chiffres, tirets)"),
  titre: z.string().trim().min(2, "Titre requis"),
  titreCourt: z.string().trim().min(2, "Titre court requis"),
  pole: z.string().trim().min(1, "Pôle requis"),
  accroche: z.string().trim().min(2, "Accroche requise"),
  duree: z.string().trim().min(1, "Durée requise"),
  format: z.string().trim().min(1, "Format requis"),
  tarif: z.string().trim().optional().nullable(),
  prioritaire: z.boolean(),
  audience: z.enum(["intermittent", "entreprise"]),
  publicCible: z.string().trim().min(1, "Public cible requis"),
  livrable: z.string().trim().min(1, "Livrable requis"),
  placesOffertes: z.number().int().min(0).optional().nullable(),
  dateDebut: z.string().trim().optional().nullable(),
  dateFin: z.string().trim().optional().nullable(),
});

export type FormationAdminInput = z.infer<typeof formationAdminSchema>;

export type AdminActionResult =
  | { ok: true; message: string; slug?: string }
  | { ok: false; error: string };

function placeholdersFromEssentials(data: FormationAdminInput) {
  const intro = data.accroche;
  return {
    slug: data.slug,
    titre: data.titre,
    titreCourt: data.titreCourt,
    pole: data.pole,
    accroche: data.accroche,
    duree: data.duree,
    format: data.format,
    tarif: data.tarif?.trim() || null,
    prioritaire: data.prioritaire,
    audience: data.audience,
    publicCible: data.publicCible,
    livrable: data.livrable,
    placesOffertes:
      typeof data.placesOffertes === "number" ? data.placesOffertes : undefined,
    dateDebut: data.dateDebut?.trim() || undefined,
    dateFin: data.dateFin?.trim() || undefined,
    intro,
    pourQui: data.publicCible,
    objectifs: [{ item: "À compléter dans l’admin Payload" }],
    programme: [{ titre: "Programme à compléter", detail: "Édition complète dans /admin" }],
    metaTitle: data.titre,
    metaDescription: data.accroche.slice(0, 160),
  };
}

export async function createFormationAction(
  raw: FormationAdminInput,
): Promise<AdminActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const parsed = formationAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  try {
    const payload = await getPayloadClient();
    const existing = await payload.find({
      collection: "formations",
      where: { slug: { equals: parsed.data.slug } },
      limit: 1,
    });
    if (existing.docs[0]) {
      return { ok: false, error: "Ce slug existe déjà" };
    }

    await payload.create({
      collection: "formations",
      data: placeholdersFromEssentials(parsed.data),
      overrideAccess: true,
    });

    revalidatePath("/formations");
    revalidatePath("/");
    return { ok: true, message: "Formation créée", slug: parsed.data.slug };
  } catch (error) {
    console.error("[createFormation]", error);
    return { ok: false, error: "Création impossible" };
  }
}

export async function updateFormationAction(
  id: number | string,
  raw: FormationAdminInput,
): Promise<AdminActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const parsed = formationAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  try {
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
        slug: parsed.data.slug,
        titre: parsed.data.titre,
        titreCourt: parsed.data.titreCourt,
        pole: parsed.data.pole,
        accroche: parsed.data.accroche,
        duree: parsed.data.duree,
        format: parsed.data.format,
        tarif: parsed.data.tarif?.trim() || null,
        prioritaire: parsed.data.prioritaire,
        audience: parsed.data.audience,
        publicCible: parsed.data.publicCible,
        livrable: parsed.data.livrable,
        placesOffertes:
          typeof parsed.data.placesOffertes === "number"
            ? parsed.data.placesOffertes
            : null,
        dateDebut: parsed.data.dateDebut?.trim() || null,
        dateFin: parsed.data.dateFin?.trim() || null,
        metaTitle: current.metaTitle || parsed.data.titre,
        metaDescription: current.metaDescription || parsed.data.accroche.slice(0, 160),
      },
      overrideAccess: true,
    });

    revalidatePath("/formations");
    revalidatePath(`/formations/${parsed.data.slug}`);
    revalidatePath("/");
    return { ok: true, message: "Formation mise à jour", slug: parsed.data.slug };
  } catch (error) {
    console.error("[updateFormation]", error);
    return { ok: false, error: "Mise à jour impossible" };
  }
}

export async function deleteFormationAction(
  id: number | string,
): Promise<AdminActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  try {
    const payload = await getPayloadClient();
    await payload.delete({
      collection: "formations",
      id,
      overrideAccess: true,
    });
    revalidatePath("/formations");
    revalidatePath("/");
    return { ok: true, message: "Formation supprimée" };
  } catch (error) {
    console.error("[deleteFormation]", error);
    return { ok: false, error: "Suppression impossible" };
  }
}
