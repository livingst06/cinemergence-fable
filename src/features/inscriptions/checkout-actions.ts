"use server";

import { revalidatePath } from "next/cache";

import { ensurePayloadUserForClerk } from "@/lib/ensure-payload-user";
import {
  ACTIVE_DEMANDE_STATUSES,
  HOLD_TTL_MINUTES,
  type InscriptionStatus,
  formatFormationSessionLabel,
  parseEurosFromTarifLabel,
} from "@/lib/inscription-status";
import {
  enforceCapacityKeepOldest,
  formationTarifEuros,
  getPlacesRestantesForSession,
  holdExpiresAtDate,
  releaseExpiredHolds,
  releaseHoldById,
} from "@/lib/places";
import { getPayloadClient } from "@/lib/payload";
import { requireAuth } from "@/lib/session-profile";
import { getPublicSiteUrl } from "@/lib/site-url";
import { eurosToStripeAmount, getStripe } from "@/lib/stripe";
import { defaultFormations } from "@/lib/formations-defaults";

const catalogBySlug = new Map(defaultFormations.map((f) => [f.slug, f]));

function resolveAmountEuros(doc: {
  slug?: string | null;
  tarifEuros?: number | null;
  tarif?: string | null;
}): number | null {
  const fromDoc = formationTarifEuros(doc);
  if (fromDoc) return fromDoc;
  const slug = doc.slug ? String(doc.slug) : "";
  const catalog = catalogBySlug.get(slug);
  if (!catalog) return null;
  return catalog.tarifEuros ?? parseEurosFromTarifLabel(catalog.tarif) ?? null;
}

export type CheckoutActionResult =
  | {
      ok: true;
      inscriptionId: string;
      clientSecret: string;
      message?: string;
    }
  | {
      ok: false;
      error: string;
      code?: "auth" | "full" | "duplicate" | "invalid" | "config" | "expired";
      inscriptionId?: string;
    };

function revalidateFormationPaths(slug?: string | null) {
  revalidatePath("/mes-reservations");
  revalidatePath("/les-sessions");
  revalidatePath("/mon-compte");
  if (slug) revalidatePath(`/formations/${slug}`);
}

/**
 * Réserve une place sur une session (hold) puis crée Stripe Embedded Checkout.
 * @param sessionId — id technique collection `formation-sessions`
 */
export async function startCheckout(
  sessionId: number | string,
): Promise<CheckoutActionResult> {
  const auth = await requireAuth();
  if (!auth.ok) return { ok: false, error: auth.error, code: "auth" };

  if (!process.env.STRIPE_SECRET_KEY?.trim()) {
    return {
      ok: false,
      error: "Paiement temporairement indisponible (configuration Stripe).",
      code: "config",
    };
  }

  let holdId: string | number | null = null;

  try {
    const user = await ensurePayloadUserForClerk();
    if (!user) {
      return { ok: false, error: "Compte utilisateur introuvable", code: "auth" };
    }

    const payload = await getPayloadClient();
    await releaseExpiredHolds({ sessionId: sessionId });

    const sessionDoc = await payload.findByID({
      collection: "formation-sessions",
      id: sessionId,
      depth: 1,
      overrideAccess: true,
    });

    if (sessionDoc.active === false) {
      return {
        ok: false,
        error: "Cette session n’est plus ouverte aux inscriptions.",
        code: "invalid",
      };
    }

    const placesOffertes =
      typeof sessionDoc.placesOffertes === "number" ? sessionDoc.placesOffertes : null;
    if (placesOffertes == null || placesOffertes <= 0) {
      return {
        ok: false,
        error: "Les réservations ne sont pas ouvertes pour cette session.",
        code: "invalid",
      };
    }

    const formation =
      typeof sessionDoc.formation === "object" && sessionDoc.formation
        ? (sessionDoc.formation as {
            id: number | string;
            titre?: string;
            slug?: string;
            tarifEuros?: number | null;
            tarif?: string | null;
          })
        : null;
    if (!formation?.id) {
      return { ok: false, error: "Formation introuvable.", code: "invalid" };
    }

    const amountEuros = resolveAmountEuros({
      slug: formation.slug,
      tarifEuros: formation.tarifEuros,
      tarif: formation.tarif,
    });

    if (amountEuros == null || amountEuros <= 0) {
      return {
        ok: false,
        error: "Tarif de paiement non configuré pour cette formation.",
        code: "invalid",
      };
    }

    const seats = await getPlacesRestantesForSession(sessionDoc.id);
    if (seats.placesRestantes != null && seats.placesRestantes <= 0) {
      return { ok: false, error: "Plus de place disponible.", code: "full" };
    }

    const existing = await payload.find({
      collection: "inscriptions",
      where: {
        and: [
          { user: { equals: user.id } },
          { session: { equals: sessionDoc.id } },
          { status: { in: ACTIVE_DEMANDE_STATUSES } },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });

    const current = existing.docs[0];
    if (current) {
      if (current.status === "en_paiement") {
        const expires = current.holdExpiresAt
          ? new Date(String(current.holdExpiresAt))
          : null;
        if (expires && expires.getTime() > Date.now()) {
          holdId = current.id;
          const resumed = await createEmbeddedSessionForHold({
            inscriptionId: current.id,
            formationTitre: String(formation.titre ?? "Formation"),
            formationSlug: formation.slug ? String(formation.slug) : null,
            sessionId: sessionDoc.id,
            dateDebut: String(sessionDoc.dateDebut),
            dateFin: String(sessionDoc.dateFin),
            amountEuros:
              typeof current.amountEuros === "number" && current.amountEuros > 0
                ? current.amountEuros
                : amountEuros,
            customerEmail: user.email ? String(user.email) : undefined,
          });
          if (!resumed.ok) return resumed;
          revalidateFormationPaths(formation.slug ? String(formation.slug) : null);
          return resumed;
        }
        await releaseHoldById(current.id);
      } else {
        return {
          ok: false,
          error: "Vous êtes déjà inscrit à cette session.",
          code: "duplicate",
          inscriptionId: String(current.id),
        };
      }
    }

    const expiresAt = holdExpiresAtDate();
    const created = await payload.create({
      collection: "inscriptions",
      data: {
        user: user.id,
        session: sessionDoc.id,
        formation: formation.id,
        status: "en_paiement" satisfies InscriptionStatus,
        amountEuros,
        currency: "eur",
        holdExpiresAt: expiresAt.toISOString(),
      },
      overrideAccess: true,
    });
    holdId = created.id;

    const kept = await enforceCapacityKeepOldest(
      sessionDoc.id,
      created.id,
      placesOffertes,
    );
    if (!kept) {
      holdId = null;
      return { ok: false, error: "Plus de place disponible.", code: "full" };
    }

    const sessionResult = await createEmbeddedSessionForHold({
      inscriptionId: created.id,
      formationTitre: String(formation.titre ?? "Formation"),
      formationSlug: formation.slug ? String(formation.slug) : null,
      sessionId: sessionDoc.id,
      dateDebut: String(sessionDoc.dateDebut),
      dateFin: String(sessionDoc.dateFin),
      amountEuros,
      customerEmail: user.email ? String(user.email) : undefined,
    });

    if (!sessionResult.ok) {
      await releaseHoldById(created.id);
      holdId = null;
      return sessionResult;
    }

    revalidateFormationPaths(formation.slug ? String(formation.slug) : null);
    return sessionResult;
  } catch (error) {
    console.error("[startCheckout]", error);
    if (holdId != null) {
      try {
        await releaseHoldById(holdId);
      } catch {
        /* ignore */
      }
    }
    return { ok: false, error: "Impossible de démarrer le paiement." };
  }
}

async function createEmbeddedSessionForHold(args: {
  inscriptionId: number | string;
  formationTitre: string;
  formationSlug: string | null;
  sessionId: number | string;
  dateDebut: string;
  dateFin: string;
  amountEuros: number;
  customerEmail?: string;
}): Promise<CheckoutActionResult> {
  const stripe = getStripe();
  const siteUrl = getPublicSiteUrl();
  const returnUrl = `${siteUrl}/paiement/succes?session_id={CHECKOUT_SESSION_ID}`;
  const expiresAtUnix = Math.floor(Date.now() / 1000) + HOLD_TTL_MINUTES * 60;

  const sessionLabel =
    formatFormationSessionLabel(args.dateDebut, args.dateFin, {
      month: "long",
    }) ?? `Session ${args.dateDebut.slice(0, 10)} → ${args.dateFin.slice(0, 10)}`;

  const description = sessionLabel;

  const paymentDescription = `${args.formationTitre} — ${sessionLabel}`;

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded_page",
    mode: "payment",
    redirect_on_completion: "if_required",
    return_url: returnUrl,
    expires_at: expiresAtUnix,
    customer_email: args.customerEmail,
    client_reference_id: String(args.inscriptionId),
    metadata: {
      inscriptionId: String(args.inscriptionId),
      sessionId: String(args.sessionId),
      formationSlug: args.formationSlug ?? "",
      dateDebut: args.dateDebut.slice(0, 10),
      dateFin: args.dateFin.slice(0, 10),
    },
    payment_intent_data: {
      description: paymentDescription,
      metadata: {
        inscriptionId: String(args.inscriptionId),
        sessionId: String(args.sessionId),
        formationSlug: args.formationSlug ?? "",
        dateDebut: args.dateDebut.slice(0, 10),
        dateFin: args.dateFin.slice(0, 10),
      },
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: eurosToStripeAmount(args.amountEuros),
          product_data: {
            name: args.formationTitre,
            description,
            metadata: {
              sessionId: String(args.sessionId),
              dateDebut: args.dateDebut.slice(0, 10),
              dateFin: args.dateFin.slice(0, 10),
            },
          },
        },
      },
    ],
  });

  if (!session.client_secret) {
    return { ok: false, error: "Session Stripe invalide.", code: "config" };
  }

  const payload = await getPayloadClient();
  await payload.update({
    collection: "inscriptions",
    id: args.inscriptionId,
    data: {
      stripeCheckoutSessionId: session.id,
      amountEuros: args.amountEuros,
      currency: "eur",
    },
    overrideAccess: true,
  });

  return {
    ok: true,
    inscriptionId: String(args.inscriptionId),
    clientSecret: session.client_secret,
  };
}

export async function cancelCheckoutHold(
  inscriptionId: number | string,
): Promise<{ ok: true } | { ok: false; error: string; code?: "auth" | "invalid" }> {
  const auth = await requireAuth();
  if (!auth.ok) return { ok: false, error: auth.error, code: "auth" };

  try {
    const user = await ensurePayloadUserForClerk();
    if (!user) return { ok: false, error: "Compte introuvable", code: "auth" };

    const payload = await getPayloadClient();
    const doc = await payload.findByID({
      collection: "inscriptions",
      id: inscriptionId,
      depth: 1,
      overrideAccess: true,
    });

    const ownerId =
      typeof doc.user === "object" && doc.user
        ? String((doc.user as { id: number | string }).id)
        : String(doc.user);
    if (ownerId !== String(user.id)) {
      return { ok: false, error: "Accès refusé", code: "invalid" };
    }

    if (doc.status === "en_paiement") {
      await releaseHoldById(doc.id);
      const formation =
        typeof doc.formation === "object" && doc.formation
          ? (doc.formation as { slug?: string })
          : null;
      revalidateFormationPaths(formation?.slug ?? null);
    }

    return { ok: true };
  } catch (error) {
    console.error("[cancelCheckoutHold]", error);
    return { ok: false, error: "Annulation impossible." };
  }
}

export async function resumeCheckoutClientSecret(
  inscriptionId: number | string,
): Promise<CheckoutActionResult> {
  const auth = await requireAuth();
  if (!auth.ok) return { ok: false, error: auth.error, code: "auth" };

  try {
    const user = await ensurePayloadUserForClerk();
    if (!user) return { ok: false, error: "Compte introuvable", code: "auth" };

    const payload = await getPayloadClient();
    await releaseExpiredHolds();

    const doc = await payload.findByID({
      collection: "inscriptions",
      id: inscriptionId,
      depth: 2,
      overrideAccess: true,
    });

    const ownerId =
      typeof doc.user === "object" && doc.user
        ? String((doc.user as { id: number | string }).id)
        : String(doc.user);
    if (ownerId !== String(user.id)) {
      return { ok: false, error: "Accès refusé", code: "invalid" };
    }

    if (doc.status !== "en_paiement") {
      return {
        ok: false,
        error: "Cette réservation n’est plus en attente de paiement.",
        code: "expired",
      };
    }

    const expires = doc.holdExpiresAt ? new Date(String(doc.holdExpiresAt)) : null;
    if (!expires || expires.getTime() <= Date.now()) {
      await releaseHoldById(doc.id);
      return { ok: false, error: "La réservation a expiré.", code: "expired" };
    }

    const formation =
      typeof doc.formation === "object" && doc.formation
        ? (doc.formation as {
            titre?: string;
            slug?: string;
            tarifEuros?: number;
            tarif?: string;
          })
        : null;

    const sessionDoc =
      typeof doc.session === "object" && doc.session
        ? (doc.session as {
            id: number | string;
            dateDebut?: string;
            dateFin?: string;
          })
        : null;

    const amountEuros =
      typeof doc.amountEuros === "number" && doc.amountEuros > 0
        ? doc.amountEuros
        : formationTarifEuros(formation ?? {}) ?? null;

    if (!amountEuros || !formation?.titre || !sessionDoc?.id) {
      return { ok: false, error: "Données de paiement incomplètes.", code: "invalid" };
    }

    return createEmbeddedSessionForHold({
      inscriptionId: doc.id,
      formationTitre: String(formation.titre),
      formationSlug: formation.slug ? String(formation.slug) : null,
      sessionId: sessionDoc.id,
      dateDebut: String(sessionDoc.dateDebut ?? ""),
      dateFin: String(sessionDoc.dateFin ?? ""),
      amountEuros,
      customerEmail: user.email ? String(user.email) : undefined,
    });
  } catch (error) {
    console.error("[resumeCheckoutClientSecret]", error);
    return { ok: false, error: "Impossible de reprendre le paiement." };
  }
}
