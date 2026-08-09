"use server";

import { revalidatePath } from "next/cache";
import type { Payload } from "payload";
import { z } from "zod";

import { deleteMediaByIds } from "@/lib/formation-media";
import { getPayloadClient } from "@/lib/payload";
import { requireAdmin } from "@/lib/session-profile";

const intervenantAdminSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "Slug requis")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalide (minuscules, chiffres, tirets)"),
  nom: z.string().trim().min(2, "Nom requis"),
  role: z.string().trim().min(2, "Rôle requis"),
  email: z
    .union([z.string().email("Email invalide"), z.literal(""), z.null()])
    .optional()
    .transform((v) => (typeof v === "string" && v.trim() ? v.trim() : null)),
  categorie: z.enum(["professionnel", "formateur"]),
  parrain: z.boolean(),
  bio: z.string().trim().min(2, "Bio requise"),
  filmographie: z.array(z.string().trim().min(1)).optional().default([]),
  photoId: z.union([z.string(), z.number()]).optional().nullable(),
});

export type IntervenantAdminInput = z.infer<typeof intervenantAdminSchema>;

export type IntervenantAdminActionResult =
  | { ok: true; message: string; id?: string }
  | { ok: false; error: string };

function revalidateIntervenantPaths() {
  revalidatePath("/intervenants");
  revalidatePath("/les-sessions");
  revalidatePath("/");
  revalidatePath("/formations");
}

function filmographieRows(titres: string[]) {
  return titres
    .map((t) => t.trim())
    .filter(Boolean)
    .map((titre) => ({ titre }));
}

function payloadDataFromInput(data: IntervenantAdminInput) {
  const email =
    typeof data.email === "string" && data.email.trim()
      ? data.email.trim()
      : null;
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

async function isLinkedToSession(
  payload: Payload,
  intervenantId: number | string,
): Promise<boolean> {
  const idStr = String(intervenantId);
  const result = await payload.find({
    collection: "formation-sessions",
    limit: 500,
    depth: 0,
    overrideAccess: true,
  });

  for (const session of result.docs) {
    const lists = [
      (session as { formateurs?: unknown }).formateurs,
      (session as { intervenants?: unknown }).intervenants,
    ];
    for (const list of lists) {
      if (!Array.isArray(list)) continue;
      for (const item of list) {
        const id =
          typeof item === "object" && item && "id" in item
            ? String((item as { id: number | string }).id)
            : String(item);
        if (id === idStr) return true;
      }
    }
  }
  return false;
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
    const payload = await getPayloadClient();
    const existing = await payload.find({
      collection: "intervenants",
      where: { slug: { equals: parsed.data.slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    if (existing.docs[0]) {
      return { ok: false, error: "Ce slug est déjà utilisé." };
    }

    const created = await payload.create({
      collection: "intervenants",
      data: payloadDataFromInput(parsed.data),
      overrideAccess: true,
    });

    revalidateIntervenantPaths();
    return {
      ok: true,
      message: "Profil créé",
      id: String(created.id),
    };
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
    const payload = await getPayloadClient();
    const clash = await payload.find({
      collection: "intervenants",
      where: {
        and: [
          { slug: { equals: parsed.data.slug } },
          { id: { not_equals: id } },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    if (clash.docs[0]) {
      return { ok: false, error: "Ce slug est déjà utilisé." };
    }

    const existing = await payload.findByID({
      collection: "intervenants",
      id,
      depth: 0,
      overrideAccess: true,
    });
    const previousPhotoId = mediaIdFrom(existing.photo);
    const nextPhotoId = parsed.data.photoId ?? null;

    await payload.update({
      collection: "intervenants",
      id,
      data: payloadDataFromInput(parsed.data),
      overrideAccess: true,
    });

    if (
      previousPhotoId != null &&
      String(previousPhotoId) !== String(nextPhotoId ?? "")
    ) {
      await deleteMediaByIds(payload, [previousPhotoId]);
    }

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
    const payload = await getPayloadClient();
    if (await isLinkedToSession(payload, id)) {
      return {
        ok: false,
        error:
          "Impossible de supprimer : ce profil est lié à au moins une session. Retire-le des sessions d’abord.",
      };
    }

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

    revalidateIntervenantPaths();
    return { ok: true, message: "Profil supprimé", id: String(id) };
  } catch (error) {
    console.error("[deleteIntervenantAction]", error);
    return { ok: false, error: "Suppression impossible" };
  }
}
