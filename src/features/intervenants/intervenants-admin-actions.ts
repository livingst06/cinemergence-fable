"use server";

import { revalidatePath } from "next/cache";

import {
  intervenantAdminSchema,
  type IntervenantAdminInput,
} from "@/features/intervenants/intervenant-admin-schema";
import {
  deleteIntervenant,
  insertIntervenant,
  intervenantLinkedToFormation,
  intervenantSlugTaken,
  updateIntervenant,
} from "@/lib/intervenant-admin";
import { requireAdmin } from "@/lib/session-profile";

export type IntervenantAdminActionResult =
  | { ok: true; message: string; id?: string }
  | { ok: false; error: string };

function revalidateIntervenantPaths() {
  revalidatePath("/intervenants");
  revalidatePath("/");
  revalidatePath("/formations");
}

export async function createIntervenantAction(
  raw: IntervenantAdminInput,
): Promise<IntervenantAdminActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const parsed = intervenantAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides",
    };
  }

  try {
    if (await intervenantSlugTaken(parsed.data.slug)) {
      return { ok: false, error: "Ce slug est déjà utilisé." };
    }
    const id = await insertIntervenant(parsed.data);
    revalidateIntervenantPaths();
    return { ok: true, message: "Profil créé", id: String(id) };
  } catch (error) {
    console.error("[createIntervenantAction]", error);
    return { ok: false, error: "Création impossible" };
  }
}

export async function updateIntervenantAction(
  id: number | string,
  raw: IntervenantAdminInput,
): Promise<IntervenantAdminActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const parsed = intervenantAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides",
    };
  }

  try {
    if (await intervenantSlugTaken(parsed.data.slug, id)) {
      return { ok: false, error: "Ce slug est déjà utilisé." };
    }
    await updateIntervenant(id, parsed.data);
    revalidateIntervenantPaths();
    return { ok: true, message: "Profil mis à jour", id: String(id) };
  } catch (error) {
    console.error("[updateIntervenantAction]", error);
    return { ok: false, error: "Modification impossible" };
  }
}

export async function deleteIntervenantAction(
  id: number | string,
): Promise<IntervenantAdminActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  try {
    if (await intervenantLinkedToFormation(id)) {
      return {
        ok: false,
        error:
          "Impossible de supprimer : ce profil est lié à au moins une formation. Retire-le des fiches d’abord.",
      };
    }
    await deleteIntervenant(id);
    revalidateIntervenantPaths();
    return { ok: true, message: "Profil supprimé", id: String(id) };
  } catch (error) {
    console.error("[deleteIntervenantAction]", error);
    return { ok: false, error: "Suppression impossible" };
  }
}
