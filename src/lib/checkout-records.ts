import "server-only";

import {
  ACTIVE_DEMANDE_STATUSES,
  type InscriptionStatus,
} from "@/lib/inscription-status";
import { getPayloadClient } from "@/lib/payload";

export async function findFormationSessionById(sessionId: number | string) {
  const payload = await getPayloadClient();
  return payload.findByID({
    collection: "formation-sessions",
    id: sessionId,
    depth: 1,
    overrideAccess: true,
  });
}

export async function findActiveInscriptionForUser(
  userId: number | string,
  sessionId: number | string,
) {
  const payload = await getPayloadClient();
  const existing = await payload.find({
    collection: "inscriptions",
    where: {
      and: [
        { user: { equals: userId } },
        { session: { equals: sessionId } },
        { status: { in: ACTIVE_DEMANDE_STATUSES } },
      ],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  return existing.docs[0] ?? null;
}

export async function createPaymentHold(input: {
  userId: number | string;
  sessionId: number | string;
  formationId: number | string;
  amountEuros: number;
  holdExpiresAt: string;
}) {
  const payload = await getPayloadClient();
  return payload.create({
    collection: "inscriptions",
    data: {
      user: input.userId,
      session: input.sessionId,
      formation: input.formationId,
      status: "en_paiement" satisfies InscriptionStatus,
      amountEuros: input.amountEuros,
      currency: "eur",
      holdExpiresAt: input.holdExpiresAt,
    },
    overrideAccess: true,
  });
}

export async function attachStripeCheckout(
  inscriptionId: number | string,
  stripeCheckoutSessionId: string,
  amountEuros: number,
) {
  const payload = await getPayloadClient();
  await payload.update({
    collection: "inscriptions",
    id: inscriptionId,
    data: {
      stripeCheckoutSessionId,
      amountEuros,
      currency: "eur",
    },
    overrideAccess: true,
  });
}

export async function findInscriptionById(inscriptionId: number | string, depth: number) {
  const payload = await getPayloadClient();
  return payload.findByID({
    collection: "inscriptions",
    id: inscriptionId,
    depth,
    overrideAccess: true,
  });
}
