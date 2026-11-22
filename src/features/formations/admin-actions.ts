"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  deleteFormationRecord,
  formationSlugTaken,
  insertFormation,
  updateFormationEssentials,
  type FormationWrite,
} from "@/lib/formation-admin";
import { requireAdmin } from "@/lib/session-profile";

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
  dureeHeures: z.number().int().min(1, "Nb heures requis"),
  dureeJours: z.number().int().min(1, "Nb jours requis"),
  format: z.string().trim().min(1, "Format requis"),
  tarif: z.string().trim().min(1, "Tarif requis"),
  tarifEuros: z.number().int().min(1, "Tarif en euros requis"),
  prioritaire: z.boolean(),
  audience: z.enum(["intermittent", "entreprise"]),
  publicCible: z.string().trim().min(1, "Public cible requis"),
  livrable: z.string().trim().min(1, "Livrable requis"),
  images: z.array(z.union([z.string(), z.number()])).max(8).optional().default([]),
});

export type FormationAdminInput = z.infer<typeof formationAdminSchema>;

export type AdminActionResult =
  | { ok: true; message: string; slug?: string }
  | { ok: false; error: string };

function revalidateFormationPaths(slug?: string) {
  revalidatePath("/formations");
  revalidatePath("/");
  if (slug) revalidatePath(`/formations/${slug}`);
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
    if (await formationSlugTaken(parsed.data.slug)) {
      return { ok: false, error: "Ce slug existe déjà" };
    }
    await insertFormation(parsed.data satisfies FormationWrite);
    revalidateFormationPaths();
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
    await updateFormationEssentials(id, parsed.data);
    revalidateFormationPaths(parsed.data.slug);
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
    await deleteFormationRecord(id);
    revalidateFormationPaths();
    revalidatePath("/galerie");
    return { ok: true, message: "Formation et médias associés supprimés" };
  } catch (error) {
    console.error("[deleteFormation]", error);
    return { ok: false, error: "Suppression impossible" };
  }
}
