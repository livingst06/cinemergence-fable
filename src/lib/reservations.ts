import "server-only";

import { getPayloadClient } from "@/lib/payload";
import { syncInscriptionIfStripePaid } from "@/lib/stripe-fulfillment";

export type ReservationRow = {
  id: number | string;
  status: string;
  commentaireAdmin?: string | null;
  formationTitre: string;
  formationSlug: string;
  dateDebut?: string;
  dateFin?: string;
};

export async function listReservationsForUser(
  payloadUserId: number | string,
): Promise<ReservationRow[]> {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "inscriptions",
      where: { user: { equals: payloadUserId } },
      depth: 1,
      limit: 100,
      sort: "-updatedAt",
      overrideAccess: true,
    });

    await Promise.all(
      result.docs
        .filter((doc) => doc.status === "en_paiement" && doc.stripeCheckoutSessionId)
        .map((doc) =>
          syncInscriptionIfStripePaid(doc.id).catch((err) => {
            console.error("[reservations] sync", doc.id, err);
            return false;
          }),
        ),
    );

    const refreshed = await payload.find({
      collection: "inscriptions",
      where: { user: { equals: payloadUserId } },
      depth: 2,
      limit: 100,
      sort: "-updatedAt",
      overrideAccess: true,
    });

    const rows: ReservationRow[] = [];
    for (const doc of refreshed.docs) {
      const formation = doc.formation;
      if (!formation || typeof formation !== "object") continue;
      const f = formation as {
        titre?: string;
        titreCourt?: string;
        slug?: string;
        dateDebut?: string;
        dateFin?: string;
      };
      if (!f.slug) continue;

      const sessionDoc =
        typeof doc.session === "object" && doc.session
          ? (doc.session as {
              dateDebut?: string;
              dateFin?: string;
              label?: string | null;
            })
          : null;

      rows.push({
        id: doc.id,
        status: String(doc.status),
        commentaireAdmin: doc.commentaireAdmin
          ? String(doc.commentaireAdmin)
          : null,
        formationTitre: String(f.titre ?? f.titreCourt ?? f.slug),
        formationSlug: String(f.slug),
        dateDebut: sessionDoc?.dateDebut
          ? String(sessionDoc.dateDebut)
          : f.dateDebut
            ? String(f.dateDebut)
            : undefined,
        dateFin: sessionDoc?.dateFin
          ? String(sessionDoc.dateFin)
          : f.dateFin
            ? String(f.dateFin)
            : undefined,
      });
    }
    return rows;
  } catch {
    return [];
  }
}
