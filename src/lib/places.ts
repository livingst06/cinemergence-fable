import "server-only";

import type { Where } from "payload";

import {
  HOLD_TTL_MINUTES,
  PLACE_TAKING_STATUSES,
  parseEurosFromTarifLabel,
} from "@/lib/inscription-status";
import { getPayloadClient } from "@/lib/payload";

export function formationPlacesOffertes(doc: {
  placesOffertes?: number | null;
  effectifMax?: number | null;
}): number | null {
  if (typeof doc.placesOffertes === "number" && doc.placesOffertes >= 0) {
    return doc.placesOffertes;
  }
  if (typeof doc.effectifMax === "number" && doc.effectifMax >= 0) {
    return doc.effectifMax;
  }
  return null;
}

export function formationTarifEuros(doc: {
  tarifEuros?: number | null;
  tarif?: string | null;
}): number | null {
  if (typeof doc.tarifEuros === "number" && doc.tarifEuros > 0) {
    return Math.trunc(doc.tarifEuros);
  }
  return parseEurosFromTarifLabel(doc.tarif ?? null);
}

export async function countPlacesPrisesForSession(
  sessionId: number | string,
): Promise<number> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "inscriptions",
    where: {
      and: [
        { session: { equals: sessionId } },
        { status: { in: PLACE_TAKING_STATUSES } },
      ],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  return result.totalDocs;
}

/** @deprecated Prefer countPlacesPrisesForSession */
export async function countPlacesPrises(formationId: number | string): Promise<number> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "inscriptions",
    where: {
      and: [
        { formation: { equals: formationId } },
        { status: { in: PLACE_TAKING_STATUSES } },
      ],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  return result.totalDocs;
}

export async function getPlacesRestantesForSession(
  sessionId: number | string,
): Promise<{
  placesOffertes: number | null;
  placesPrises: number;
  placesRestantes: number | null;
}> {
  const payload = await getPayloadClient();
  const sessionDoc = await payload.findByID({
    collection: "formation-sessions",
    id: sessionId,
    depth: 0,
    overrideAccess: true,
  });
  const placesOffertes =
    typeof sessionDoc.placesOffertes === "number" ? sessionDoc.placesOffertes : null;
  const placesPrises = await countPlacesPrisesForSession(sessionId);
  return {
    placesOffertes,
    placesPrises,
    placesRestantes:
      placesOffertes == null ? null : Math.max(0, placesOffertes - placesPrises),
  };
}

/** Agrège la prochaine session active d’une formation (cartes catalogue). */
export async function getPlacesRestantes(formationId: number | string): Promise<{
  placesOffertes: number | null;
  placesPrises: number;
  placesRestantes: number | null;
}> {
  const payload = await getPayloadClient();
  const sessions = await payload.find({
    collection: "formation-sessions",
    where: {
      and: [
        { formation: { equals: formationId } },
        { active: { equals: true } },
      ],
    },
    sort: "dateDebut",
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  const sessionDoc = sessions.docs[0];
  if (sessionDoc) {
    return getPlacesRestantesForSession(sessionDoc.id);
  }

  // Fallback legacy (formation sans session encore)
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
  const placesPrises = await countPlacesPrises(formationId);
  return {
    placesOffertes,
    placesPrises,
    placesRestantes:
      placesOffertes == null ? null : Math.max(0, placesOffertes - placesPrises),
  };
}

export async function getPlacesRestantesMap(
  formations: Array<{
    id?: number | string;
    placesOffertes?: number;
    effectifMax?: number;
  }>,
): Promise<Record<string, number | null>> {
  const withId = formations.filter((f) => f.id != null);
  const map: Record<string, number | null> = {};
  if (withId.length === 0) return map;

  await Promise.all(
    withId.map(async (formation) => {
      const id = String(formation.id);
      try {
        const seats = await getPlacesRestantes(formation.id!);
        map[id] = seats.placesRestantes;
      } catch {
        map[id] = null;
      }
    }),
  );
  return map;
}

export async function releaseExpiredHolds(
  scope?: { formationId?: number | string; sessionId?: number | string },
): Promise<number> {
  const payload = await getPayloadClient();
  const nowIso = new Date().toISOString();
  const and: Where[] = [
    { status: { equals: "en_paiement" } },
    { holdExpiresAt: { less_than: nowIso } },
  ];
  if (scope?.sessionId != null) {
    and.push({ session: { equals: scope.sessionId } });
  } else if (scope?.formationId != null) {
    and.push({ formation: { equals: scope.formationId } });
  }

  const expired = await payload.find({
    collection: "inscriptions",
    where: { and },
    limit: 100,
    depth: 0,
    overrideAccess: true,
  });

  let released = 0;
  for (const doc of expired.docs) {
    await payload.update({
      collection: "inscriptions",
      id: doc.id,
      data: { status: "annule" },
      overrideAccess: true,
    });
    released += 1;
  }
  return released;
}

/** @deprecated Use releaseExpiredHolds({ formationId }) */
export async function releaseExpiredHoldsLegacy(
  formationId?: number | string,
): Promise<number> {
  return releaseExpiredHolds(
    formationId != null ? { formationId } : undefined,
  );
}

export function holdExpiresAtDate(from = new Date()): Date {
  return new Date(from.getTime() + HOLD_TTL_MINUTES * 60 * 1000);
}

export async function enforceCapacityKeepOldest(
  sessionId: number | string,
  inscriptionId: number | string,
  placesOffertes: number,
): Promise<boolean> {
  const payload = await getPayloadClient();
  const taking = await payload.find({
    collection: "inscriptions",
    where: {
      and: [
        { session: { equals: sessionId } },
        { status: { in: PLACE_TAKING_STATUSES } },
      ],
    },
    sort: "createdAt",
    limit: 200,
    depth: 0,
    overrideAccess: true,
  });

  if (taking.docs.length <= placesOffertes) return true;

  const keep = new Set(
    taking.docs.slice(0, placesOffertes).map((d) => String(d.id)),
  );

  for (const doc of taking.docs.slice(placesOffertes)) {
    if (doc.status !== "en_paiement") continue;
    await payload.update({
      collection: "inscriptions",
      id: doc.id,
      data: { status: "annule" },
      overrideAccess: true,
    });
  }

  return keep.has(String(inscriptionId));
}

export async function releaseHoldById(
  inscriptionId: number | string,
  opts?: { onlyIfEnPaiement?: boolean },
): Promise<boolean> {
  const payload = await getPayloadClient();
  const doc = await payload.findByID({
    collection: "inscriptions",
    id: inscriptionId,
    depth: 0,
    overrideAccess: true,
  });
  if (!doc) return false;
  if (opts?.onlyIfEnPaiement !== false && doc.status !== "en_paiement") {
    return false;
  }
  await payload.update({
    collection: "inscriptions",
    id: inscriptionId,
    data: { status: "annule" },
    overrideAccess: true,
  });
  return true;
}

export type FormationSessionView = {
  id: number | string;
  label: string | null;
  dateDebut: string;
  dateFin: string;
  placesOffertes: number;
  placesRestantes: number | null;
  tarifEuros: number | null;
  active: boolean;
  alreadyEnrolled: boolean;
  checkoutPending: boolean;
  pendingInscriptionId: string | null;
};

export async function listSessionsForFormation(
  formationId: number | string,
  opts?: { userId?: number | string | null },
): Promise<FormationSessionView[]> {
  const payload = await getPayloadClient();
  await releaseExpiredHolds({ formationId });

  const result = await payload.find({
    collection: "formation-sessions",
    where: { formation: { equals: formationId } },
    sort: "dateDebut",
    limit: 50,
    depth: 0,
    overrideAccess: true,
  });

  let formationTarif: number | null = null;
  try {
    const formation = await payload.findByID({
      collection: "formations",
      id: formationId,
      depth: 0,
      overrideAccess: true,
    });
    formationTarif = formationTarifEuros(
      formation as { tarifEuros?: number | null; tarif?: string | null },
    );
  } catch {
    formationTarif = null;
  }

  const views: FormationSessionView[] = [];
  for (const doc of result.docs) {
    const seats = await getPlacesRestantesForSession(doc.id);
    let alreadyEnrolled = false;
    let checkoutPending = false;
    let pendingInscriptionId: string | null = null;

    if (opts?.userId != null) {
      const existing = await payload.find({
        collection: "inscriptions",
        where: {
          and: [
            { user: { equals: opts.userId } },
            { session: { equals: doc.id } },
            {
              status: {
                in: [
                  "en_instruction",
                  "en_paiement",
                  "payee",
                  "demande",
                  "validee",
                  "inscrit",
                  "pieces_complementaires",
                ],
              },
            },
          ],
        },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      });
      const insc = existing.docs[0];
      if (insc) {
        if (insc.status === "en_paiement") {
          checkoutPending = true;
          pendingInscriptionId = String(insc.id);
        } else {
          alreadyEnrolled = true;
        }
      }
    }

    views.push({
      id: doc.id,
      label: doc.label ? String(doc.label) : null,
      dateDebut: String(doc.dateDebut),
      dateFin: String(doc.dateFin),
      placesOffertes:
        typeof doc.placesOffertes === "number" ? doc.placesOffertes : 0,
      placesRestantes: seats.placesRestantes,
      tarifEuros: formationTarif,
      active: doc.active !== false,
      alreadyEnrolled,
      checkoutPending,
      pendingInscriptionId,
    });
  }
  return views;
}

export type NextSessionSummary = {
  dateDebut: string;
  dateFin: string;
  placesRestantes: number | null;
  sessionCount: number;
};

/** Prochaine session active + places, pour les cards catalogue. */
export async function getNextSessionMap(
  formations: Array<{ id?: number | string }>,
): Promise<Record<string, NextSessionSummary | null>> {
  const withId = formations.filter((f) => f.id != null);
  const map: Record<string, NextSessionSummary | null> = {};
  if (withId.length === 0) return map;

  await Promise.all(
    withId.map(async (formation) => {
      const id = String(formation.id);
      try {
        const sessions = await listSessionsForFormation(formation.id!);
        const active = sessions.filter((s) => s.active);
        if (active.length === 0) {
          map[id] = null;
          return;
        }
        const next =
          active.find(
            (s) => s.placesRestantes == null || s.placesRestantes > 0,
          ) ?? active[0]!;
        map[id] = {
          dateDebut: next.dateDebut,
          dateFin: next.dateFin,
          placesRestantes: next.placesRestantes,
          sessionCount: active.length,
        };
      } catch {
        map[id] = null;
      }
    }),
  );
  return map;
}
