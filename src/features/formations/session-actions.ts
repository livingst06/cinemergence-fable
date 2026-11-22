"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createFormationSessionRecord,
  deleteFormationSessionRecord,
  listFormationOptions,
  listSessionStaffOptions,
  readFormationSessionForUpdate,
  updateFormationSessionRecord,
  type FormationOption,
  type SessionStaffOption,
} from "@/lib/formation-session-store";
import { requireAdmin } from "@/lib/session-profile";

const sessionFieldsSchema = z
  .object({
    formationId: z.union([z.string(), z.number()]),
    dateDebut: z.string().trim().min(1, "Date de début requise"),
    dateFin: z.string().trim().min(1, "Date de fin requise"),
    placesOffertes: z.number().int().min(1, "Au moins 1 place"),
    label: z.string().trim().optional().nullable(),
    active: z.boolean().optional().default(true),
    formateurIds: z
      .array(z.union([z.string(), z.number()]))
      .optional()
      .default([]),
    intervenantIds: z
      .array(z.union([z.string(), z.number()]))
      .optional()
      .default([]),
  })
  .refine(
    (d) => new Date(d.dateFin).getTime() >= new Date(d.dateDebut).getTime(),
    { message: "La date de fin doit être après la date de début", path: ["dateFin"] },
  );

export type SessionFieldsInput = z.infer<typeof sessionFieldsSchema>;
/** @deprecated Prefer SessionFieldsInput */
export type CreateSessionInput = SessionFieldsInput;

export type SessionActionResult =
  | { ok: true; message: string; sessionId?: string }
  | { ok: false; error: string };

export type { FormationOption, SessionStaffOption };

function revalidateSessionPaths(formationSlug?: string | null) {
  revalidatePath("/les-sessions");
  revalidatePath("/formations");
  if (formationSlug) {
    revalidatePath(`/formations/${formationSlug}`);
  }
  revalidatePath("/");
}

export async function createFormationSession(
  raw: SessionFieldsInput,
): Promise<SessionActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const parsed = sessionFieldsSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides",
    };
  }

  try {
    const created = await createFormationSessionRecord(parsed.data);
    revalidateSessionPaths(created.formationSlug);
    return {
      ok: true,
      message: "Session créée",
      sessionId: String(created.id),
    };
  } catch (error) {
    console.error("[createFormationSession]", error);
    return { ok: false, error: "Création de session impossible" };
  }
}

export async function updateFormationSession(
  sessionId: number | string,
  raw: SessionFieldsInput,
): Promise<SessionActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const parsed = sessionFieldsSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides",
    };
  }

  try {
    const current = await readFormationSessionForUpdate(sessionId);
    if (parsed.data.placesOffertes < current.enrolledCount) {
      const enrolledCount = current.enrolledCount;
      return {
        ok: false,
        error:
          enrolledCount === 0
            ? "Nombre de places invalide"
            : `La capacité ne peut pas être inférieure aux ${enrolledCount} élève${enrolledCount > 1 ? "s" : ""} déjà inscrit${enrolledCount > 1 ? "s" : ""}.`,
      };
    }
    if (String(parsed.data.formationId) !== current.lockedFormationId) {
      return {
        ok: false,
        error: "La formation d’une session ne peut pas être modifiée.",
      };
    }
    await updateFormationSessionRecord(sessionId, parsed.data);
    revalidateSessionPaths(current.formationSlug);
    return { ok: true, message: "Session mise à jour", sessionId: String(sessionId) };
  } catch (error) {
    console.error("[updateFormationSession]", error);
    return { ok: false, error: "Modification de session impossible" };
  }
}

export async function deleteFormationSession(
  sessionId: number | string,
): Promise<SessionActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  try {
    const deleted = await deleteFormationSessionRecord(sessionId);
    if (deleted.blocked) {
      return {
        ok: false,
        error:
          "Impossible de supprimer une session qui a déjà au moins un élève inscrit.",
      };
    }
    revalidateSessionPaths(deleted.formationSlug);
    return { ok: true, message: "Session supprimée", sessionId: String(sessionId) };
  } catch (error) {
    console.error("[deleteFormationSession]", error);
    return { ok: false, error: "Suppression de session impossible" };
  }
}

export async function listFormationsForSessionSelect(): Promise<FormationOption[]> {
  const auth = await requireAdmin();
  if (!auth.ok) return [];
  try {
    return await listFormationOptions();
  } catch {
    return [];
  }
}

export async function listStaffUsersForSessionSelect(): Promise<SessionStaffOption[]> {
  const auth = await requireAdmin();
  if (!auth.ok) return [];
  try {
    return await listSessionStaffOptions();
  } catch {
    return [];
  }
}
