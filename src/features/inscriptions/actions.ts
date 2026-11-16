"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ensurePayloadUserForClerk } from "@/lib/ensure-payload-user";
import {
  ACTIVE_DEMANDE_STATUSES,
  PLACE_TAKING_STATUSES,
  type InscriptionStatus,
  normalizeInscriptionStatus,
} from "@/lib/inscription-status";
import {
  countPlacesPrises,
  formationPlacesOffertes,
  getPlacesRestantes,
} from "@/lib/places";
import { getPayloadClient } from "@/lib/payload";
import { requireAdmin, requireAuth } from "@/lib/session-profile";

export type InscriptionActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string; code?: "auth" | "full" | "duplicate" | "invalid" };

export { countPlacesPrises, getPlacesRestantes };

export async function createInscriptionDemande(
  formationId: number | string,
): Promise<InscriptionActionResult> {
  const auth = await requireAuth();
  if (!auth.ok) return { ok: false, error: auth.error, code: "auth" };

  try {
    const user = await ensurePayloadUserForClerk();
    if (!user) {
      return { ok: false, error: "Compte utilisateur introuvable", code: "auth" };
    }

    const payload = await getPayloadClient();
    const formation = await payload.findByID({
      collection: "formations",
      id: formationId,
      depth: 0,
    });

    const placesOffertes = formationPlacesOffertes(
      formation as unknown as {
        placesOffertes?: number | null;
        effectifMax?: number | null;
      },
    );
    if (placesOffertes == null || placesOffertes <= 0) {
      return {
        ok: false,
        error: "Les réservations ne sont pas ouvertes pour cette formation.",
        code: "invalid",
      };
    }

    const placesPrises = await countPlacesPrises(formation.id);
    if (placesPrises >= placesOffertes) {
      return { ok: false, error: "Plus de place disponible.", code: "full" };
    }

    const existing = await payload.find({
      collection: "inscriptions",
      where: {
        and: [
          { user: { equals: user.id } },
          { formation: { equals: formation.id } },
          { status: { in: ACTIVE_DEMANDE_STATUSES } },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });

    if (existing.docs[0]) {
      return {
        ok: false,
        error: "Vous avez déjà une demande active pour cette formation.",
        code: "duplicate",
      };
    }

    await payload.create({
      collection: "inscriptions",
      data: {
        user: user.id,
        formation: formation.id,
        status: "en_instruction",
      },
      overrideAccess: true,
    });

    revalidatePath("/mes-reservations");
    revalidatePath("/les-demandes");
    revalidatePath("/mon-compte");
    if (formation.slug) revalidatePath(`/formations/${formation.slug}`);

    return { ok: true, message: "Demande envoyée. Elle est en cours d'instruction." };
  } catch (error) {
    console.error("[createInscriptionDemande]", error);
    return { ok: false, error: "Impossible d'envoyer la demande." };
  }
}

const setStatusSchema = z.object({
  id: z.union([z.string(), z.number()]),
  status: z.enum(["en_instruction", "validee", "refusee", "pieces_complementaires"]),
  commentaireAdmin: z.string().trim().optional().nullable(),
});

export async function setInscriptionStatus(
  raw: z.infer<typeof setStatusSchema>,
): Promise<InscriptionActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const parsed = setStatusSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const { id, status, commentaireAdmin } = parsed.data;

  if (
    (status === "refusee" || status === "pieces_complementaires") &&
    !commentaireAdmin?.trim()
  ) {
    return {
      ok: false,
      error: "Un commentaire est requis pour ce statut.",
      code: "invalid",
    };
  }

  try {
    const payload = await getPayloadClient();
    const current = await payload.findByID({
      collection: "inscriptions",
      id,
      depth: 0,
    });

    const formationId =
      typeof current.formation === "object" && current.formation
        ? (current.formation as { id: number | string }).id
        : current.formation;

    if (status === "validee" && formationId) {
      const seats = await getPlacesRestantes(formationId);
      const alreadyTaking = PLACE_TAKING_STATUSES.includes(
        normalizeInscriptionStatus(String(current.status)) as InscriptionStatus,
      );
      if (
        seats.placesRestantes != null &&
        seats.placesRestantes <= 0 &&
        !alreadyTaking
      ) {
        return { ok: false, error: "Plus de place disponible.", code: "full" };
      }
    }

    await payload.update({
      collection: "inscriptions",
      id,
      data: {
        status,
        commentaireAdmin: commentaireAdmin?.trim() || null,
      },
      overrideAccess: true,
    });

    revalidatePath("/les-demandes");
    revalidatePath("/mes-reservations");
    revalidatePath("/mon-compte");

    return { ok: true, message: "Statut mis à jour." };
  } catch (error) {
    console.error("[setInscriptionStatus]", error);
    return { ok: false, error: "Mise à jour impossible." };
  }
}
