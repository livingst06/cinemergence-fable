"use server";

import { revalidatePath } from "next/cache";
import type { Payload } from "payload";
import { z } from "zod";

import { getPayloadClient } from "@/lib/payload";
import { requireAdmin } from "@/lib/session-profile";

const ENROLLED_STATUSES = ["payee", "validee", "inscrit"] as const;

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

async function sessionHasEnrolledTrainee(
  payload: Payload,
  sessionId: number | string,
): Promise<boolean> {
  return (await countEnrolledForSession(payload, sessionId)) > 0;
}

async function countEnrolledForSession(
  payload: Payload,
  sessionId: number | string,
): Promise<number> {
  const result = await payload.find({
    collection: "inscriptions",
    where: {
      and: [
        { session: { equals: sessionId } },
        { status: { in: [...ENROLLED_STATUSES] } },
      ],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  return result.totalDocs;
}

function revalidateSessionPaths(formationSlug?: string | null) {
  revalidatePath("/les-sessions");
  revalidatePath("/formations");
  if (formationSlug) {
    revalidatePath(`/formations/${formationSlug}`);
  }
  revalidatePath("/");
}

/** Payload + Postgres refusent les IDs relation en string (« 5 ») — il faut des numbers. */
function toRelationIds(
  ids: Array<string | number>,
): Array<number | string> {
  return ids.map((id) => {
    if (typeof id === "number" && Number.isFinite(id)) return id;
    const n = Number(id);
    return Number.isInteger(n) ? n : id;
  });
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
    const payload = await getPayloadClient();
    const formation = await payload.findByID({
      collection: "formations",
      id: parsed.data.formationId,
      depth: 0,
      overrideAccess: true,
    });

    const created = await payload.create({
      collection: "formation-sessions",
      data: {
        formation: formation.id,
        dateDebut: parsed.data.dateDebut.slice(0, 10),
        dateFin: parsed.data.dateFin.slice(0, 10),
        placesOffertes: parsed.data.placesOffertes,
        label: parsed.data.label?.trim() || undefined,
        active: parsed.data.active !== false,
        formateurs: toRelationIds(parsed.data.formateurIds),
        intervenants: toRelationIds(parsed.data.intervenantIds),
      },
      overrideAccess: true,
    });

    revalidateSessionPaths(
      formation.slug ? String(formation.slug) : null,
    );

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
    const payload = await getPayloadClient();
    const enrolledCount = await countEnrolledForSession(payload, sessionId);

    if (parsed.data.placesOffertes < enrolledCount) {
      return {
        ok: false,
        error:
          enrolledCount === 0
            ? "Nombre de places invalide"
            : `La capacité ne peut pas être inférieure aux ${enrolledCount} stagiaire${enrolledCount > 1 ? "s" : ""} déjà inscrit${enrolledCount > 1 ? "s" : ""}.`,
      };
    }

    const existing = await payload.findByID({
      collection: "formation-sessions",
      id: sessionId,
      depth: 0,
      overrideAccess: true,
    });

    const lockedFormationId =
      typeof existing.formation === "object" && existing.formation
        ? String((existing.formation as { id: number | string }).id)
        : String(existing.formation);

    if (String(parsed.data.formationId) !== lockedFormationId) {
      return {
        ok: false,
        error: "La formation d’une session ne peut pas être modifiée.",
      };
    }

    const formation = await payload.findByID({
      collection: "formations",
      id: lockedFormationId,
      depth: 0,
      overrideAccess: true,
    });

    await payload.update({
      collection: "formation-sessions",
      id: sessionId,
      data: {
        dateDebut: parsed.data.dateDebut.slice(0, 10),
        dateFin: parsed.data.dateFin.slice(0, 10),
        placesOffertes: parsed.data.placesOffertes,
        label: parsed.data.label?.trim() || null,
        active: parsed.data.active !== false,
        formateurs: toRelationIds(parsed.data.formateurIds),
        intervenants: toRelationIds(parsed.data.intervenantIds),
      },
      overrideAccess: true,
    });

    revalidateSessionPaths(
      formation.slug ? String(formation.slug) : null,
    );

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
    const payload = await getPayloadClient();
    if (await sessionHasEnrolledTrainee(payload, sessionId)) {
      return {
        ok: false,
        error:
          "Impossible de supprimer une session qui a déjà au moins un stagiaire inscrit.",
      };
    }

    const existing = await payload.findByID({
      collection: "formation-sessions",
      id: sessionId,
      depth: 1,
      overrideAccess: true,
    });

    const formationSlug =
      typeof existing.formation === "object" && existing.formation
        ? String((existing.formation as { slug?: string }).slug ?? "")
        : null;

    // Annuler les inscriptions non confirmées liées à la session (holds, etc.)
    const leftovers = await payload.find({
      collection: "inscriptions",
      where: { session: { equals: sessionId } },
      limit: 200,
      depth: 0,
      overrideAccess: true,
    });
    for (const doc of leftovers.docs) {
      await payload.delete({
        collection: "inscriptions",
        id: doc.id,
        overrideAccess: true,
      });
    }

    await payload.delete({
      collection: "formation-sessions",
      id: sessionId,
      overrideAccess: true,
    });

    revalidateSessionPaths(formationSlug || null);

    return { ok: true, message: "Session supprimée", sessionId: String(sessionId) };
  } catch (error) {
    console.error("[deleteFormationSession]", error);
    return { ok: false, error: "Suppression de session impossible" };
  }
}

export type FormationOption = {
  id: number | string;
  titre: string;
  slug: string;
  tarifEuros: number | null;
  tarif: string | null;
};

export type IntervenantOption = {
  id: number | string;
  nom: string;
  role: string;
  slug: string;
  categorie: "formateur" | "professionnel";
};

export async function listFormationsForSessionSelect(): Promise<
  FormationOption[]
> {
  const auth = await requireAdmin();
  if (!auth.ok) return [];

  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "formations",
      limit: 200,
      sort: "titre",
      depth: 0,
      overrideAccess: true,
    });
    return result.docs.map((doc) => ({
      id: doc.id,
      titre: String(doc.titre ?? doc.titreCourt ?? doc.slug),
      slug: String(doc.slug),
      tarifEuros:
        typeof doc.tarifEuros === "number" && doc.tarifEuros > 0
          ? doc.tarifEuros
          : null,
      tarif: doc.tarif ? String(doc.tarif) : null,
    }));
  } catch {
    return [];
  }
}

export async function listIntervenantsForSessionSelect(): Promise<
  IntervenantOption[]
> {
  const auth = await requireAdmin();
  if (!auth.ok) return [];

  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "intervenants",
      limit: 200,
      sort: "nom",
      depth: 0,
      overrideAccess: true,
    });
    return result.docs
      .map((doc) => {
        const categorie =
          doc.categorie === "formateur" || doc.categorie === "professionnel"
            ? doc.categorie
            : "professionnel";
        return {
          id: doc.id,
          nom: String(doc.nom ?? ""),
          role: String(doc.role ?? ""),
          slug: String(doc.slug ?? ""),
          categorie,
        };
      })
      .filter((i) => i.nom && i.slug);
  } catch {
    return [];
  }
}
