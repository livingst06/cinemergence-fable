import "server-only";

import { getPayloadClient } from "@/lib/payload";

export async function findInscriptionById(inscriptionId: string) {
  const payload = await getPayloadClient();
  return payload.findByID({
    collection: "inscriptions",
    id: inscriptionId,
    depth: 2,
    overrideAccess: true,
  });
}
