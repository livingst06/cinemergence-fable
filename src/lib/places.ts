import "server-only";

import { PLACE_TAKING_STATUSES } from "@/lib/inscription-status";
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

export async function getPlacesRestantes(formationId: number | string): Promise<{
  placesOffertes: number | null;
  placesPrises: number;
  placesRestantes: number | null;
}> {
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
  const placesPrises = await countPlacesPrises(formationId);
  return {
    placesOffertes,
    placesPrises,
    placesRestantes:
      placesOffertes == null ? null : Math.max(0, placesOffertes - placesPrises),
  };
}

/** Map id formation → places restantes (null = non configuré). */
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

  const payload = await getPayloadClient();
  const inscriptions = await payload.find({
    collection: "inscriptions",
    where: { status: { in: PLACE_TAKING_STATUSES } },
    limit: 1000,
    depth: 0,
    overrideAccess: true,
  });

  const prisesByFormation = new Map<string, number>();
  for (const doc of inscriptions.docs) {
    const formationRef = doc.formation;
    const fid =
      typeof formationRef === "object" && formationRef
        ? String((formationRef as { id: number | string }).id)
        : String(formationRef);
    prisesByFormation.set(fid, (prisesByFormation.get(fid) ?? 0) + 1);
  }

  for (const formation of withId) {
    const id = String(formation.id);
    const offertes = formationPlacesOffertes(formation);
    if (offertes == null) {
      map[id] = null;
      continue;
    }
    const prises = prisesByFormation.get(id) ?? 0;
    map[id] = Math.max(0, offertes - prises);
  }

  return map;
}
