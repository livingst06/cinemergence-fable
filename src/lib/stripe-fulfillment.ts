import "server-only";

import { revalidatePath } from "next/cache";
import type Stripe from "stripe";

import { getPayloadClient } from "@/lib/payload";
import { releaseHoldById } from "@/lib/places";
import { getStripe } from "@/lib/stripe";

async function findInscriptionBySession(session: Stripe.Checkout.Session) {
  const payload = await getPayloadClient();
  const inscriptionId =
    session.metadata?.inscriptionId || session.client_reference_id || null;

  if (inscriptionId) {
    try {
      return await payload.findByID({
        collection: "inscriptions",
        id: inscriptionId,
        depth: 1,
        overrideAccess: true,
      });
    } catch {
      /* fall through */
    }
  }

  if (session.id) {
    const found = await payload.find({
      collection: "inscriptions",
      where: { stripeCheckoutSessionId: { equals: session.id } },
      limit: 1,
      depth: 1,
      overrideAccess: true,
    });
    return found.docs[0] ?? null;
  }

  return null;
}

function formationSlugFromDoc(doc: { formation?: unknown } | null | undefined): string | null {
  const f = doc?.formation;
  if (typeof f === "object" && f && "slug" in f) {
    return String((f as { slug?: string }).slug ?? "") || null;
  }
  return null;
}

function revalidateInscriptionPaths(slug: string | null) {
  revalidatePath("/mes-reservations");
  revalidatePath("/les-sessions");
  revalidatePath("/mon-compte");
  if (slug) revalidatePath(`/formations/${slug}`);
}

/**
 * Passe une inscription en `payee` (= place confirmée) après paiement Stripe.
 * Idempotent. Aucune validation admin n’est requise ensuite.
 */
export async function confirmPaidFromCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<{ ok: boolean; inscriptionId?: string; titre?: string | null }> {
  const payload = await getPayloadClient();
  const doc = await findInscriptionBySession(session);
  if (!doc) {
    console.error("[stripe.fulfill] inscription introuvable", session.id);
    return { ok: false };
  }

  const titre =
    typeof doc.formation === "object" && doc.formation
      ? String((doc.formation as { titre?: string }).titre ?? "") || null
      : null;

  if (doc.status === "payee" || doc.status === "validee" || doc.status === "inscrit") {
    return { ok: true, inscriptionId: String(doc.id), titre };
  }

  const paymentIntent =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  const isPaid =
    session.payment_status === "paid" ||
    session.status === "complete";

  if (!isPaid) {
    return { ok: false, inscriptionId: String(doc.id), titre };
  }

  if (doc.status !== "en_paiement") {
    if (paymentIntent) {
      const stripe = getStripe();
      await stripe.refunds.create({ payment_intent: paymentIntent });
      console.warn("[stripe.fulfill] remboursement : statut inattendu", doc.id, doc.status);
    }
    return { ok: false, inscriptionId: String(doc.id), titre };
  }

  await payload.update({
    collection: "inscriptions",
    id: doc.id,
    data: {
      status: "payee",
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: paymentIntent,
    },
    overrideAccess: true,
  });

  revalidateInscriptionPaths(formationSlugFromDoc(doc as { formation?: unknown }));
  return { ok: true, inscriptionId: String(doc.id), titre };
}

export async function releaseHoldFromCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const doc = await findInscriptionBySession(session);
  if (!doc || doc.status !== "en_paiement") return;
  await releaseHoldById(doc.id);
  revalidateInscriptionPaths(formationSlugFromDoc(doc as { formation?: unknown }));
}

/** Si une session Stripe connue est déjà payée, synchronise le statut local. */
export async function syncInscriptionIfStripePaid(
  inscriptionId: number | string,
): Promise<boolean> {
  const payload = await getPayloadClient();
  const doc = await payload.findByID({
    collection: "inscriptions",
    id: inscriptionId,
    depth: 0,
    overrideAccess: true,
  });
  if (!doc || doc.status !== "en_paiement") return doc?.status === "payee";
  const sessionId = doc.stripeCheckoutSessionId
    ? String(doc.stripeCheckoutSessionId)
    : null;
  if (!sessionId || !process.env.STRIPE_SECRET_KEY) return false;

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid" && session.status !== "complete") {
    return false;
  }
  const result = await confirmPaidFromCheckoutSession(session);
  return result.ok;
}
