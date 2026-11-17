import "server-only";

import { revalidatePath } from "next/cache";
import type Stripe from "stripe";

import { getPayloadClient } from "@/lib/payload";
import { releaseHoldById } from "@/lib/places";

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
  revalidatePath("/les-paiements");
  revalidatePath("/mon-compte");
  if (slug) revalidatePath(`/formations/${slug}`);
}

export async function releaseHoldFromCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const doc = await findInscriptionBySession(session);
  if (!doc || doc.status !== "en_paiement") return;
  await releaseHoldById(doc.id);
  revalidateInscriptionPaths(formationSlugFromDoc(doc as { formation?: unknown }));
}
