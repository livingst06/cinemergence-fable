import "server-only";

import { listPaiementsForPayer } from "@/lib/paiements";
import { getPayloadClient } from "@/lib/payload";
import { ensureSalonForSession, relationId } from "@/lib/session-salon";

export type ReservationRow = {
  id: number | string;
  status: string;
  commentaireAdmin?: string | null;
  formationTitre: string;
  formationSlug: string;
  dateDebut?: string;
  dateFin?: string;
  sessionId?: string;
  salonId?: string;
};

export async function listReservationsForUser(
  payloadUserId: number | string,
): Promise<ReservationRow[]> {
  try {
    const payload = await getPayloadClient();
    const user = await payload.findByID({
      collection: "users",
      id: payloadUserId,
      depth: 0,
      overrideAccess: true,
    });
    const email = typeof user.email === "string" ? user.email : null;
    const paid = await listPaiementsForPayer({ userId: payloadUserId, email });
    const paidSessions = new Set(
      paid.map((paiement) => (paiement.sessionId == null ? "" : String(paiement.sessionId))),
    );

    const rows: ReservationRow[] = [];
    for (const paiement of paid) {
      let salonId: string | undefined;
      if (paiement.sessionId != null) {
        try {
          const salon = await ensureSalonForSession(payload, paiement.sessionId);
          if (salon) salonId = String(salon.id);
        } catch (err) {
          console.error("[reservations] salon", paiement.sessionId, err);
        }
      }
      rows.push({
        id: paiement.checkoutSessionId,
        status: "payee",
        formationTitre: paiement.formationTitre || paiement.formationSlug,
        formationSlug: paiement.formationSlug,
        dateDebut: paiement.sessionDateDebut ?? undefined,
        dateFin: paiement.sessionDateFin ?? undefined,
        sessionId: paiement.sessionId == null ? undefined : String(paiement.sessionId),
        salonId,
      });
    }

    const holds = await payload.find({
      collection: "inscriptions",
      where: {
        and: [
          { user: { equals: payloadUserId } },
          { status: { equals: "en_paiement" } },
        ],
      },
      depth: 1,
      limit: 50,
      overrideAccess: true,
    });

    const now = Date.now();
    for (const doc of holds.docs) {
      const sessionId = relationId(doc.session);
      if (sessionId != null && paidSessions.has(String(sessionId))) continue;
      const expires = doc.holdExpiresAt ? new Date(String(doc.holdExpiresAt)).getTime() : 0;
      if (expires <= now) continue;
      const formation = doc.formation;
      if (!formation || typeof formation !== "object") continue;
      const f = formation as { titre?: string; titreCourt?: string; slug?: string };
      if (!f.slug) continue;
      const sessionDoc =
        typeof doc.session === "object" && doc.session
          ? (doc.session as { dateDebut?: string; dateFin?: string })
          : null;
      rows.push({
        id: doc.id,
        status: "en_paiement",
        formationTitre: String(f.titre ?? f.titreCourt ?? f.slug),
        formationSlug: String(f.slug),
        dateDebut: sessionDoc?.dateDebut ? String(sessionDoc.dateDebut) : undefined,
        dateFin: sessionDoc?.dateFin ? String(sessionDoc.dateFin) : undefined,
        sessionId: sessionId == null ? undefined : String(sessionId),
      });
    }

    return rows;
  } catch {
    return [];
  }
}
