import type { Payload } from "payload";

const ADMIN_EMAIL = "verdat.sylvain@gmail.com";
const LEGACY_ADMIN_EMAIL = "admin@cinemergence.paris";

/**
 * S'assure que le compte admin (verdat.sylvain@gmail.com) a bien role: "admin".
 * Si un ancien document existe encore sous l'ex-email de seed local
 * (admin@cinemergence.paris), il est renommé pour que la liaison par email de
 * la stratégie Clerk (src/lib/clerk-strategy.ts) le retrouve à la connexion.
 */
export async function ensureAdminRole(payload: Payload): Promise<string | null> {
  const byNewEmail = await payload.find({
    collection: "users",
    where: { email: { equals: ADMIN_EMAIL } },
    limit: 1,
  });

  let doc = byNewEmail.docs[0];

  if (!doc) {
    const byLegacyEmail = await payload.find({
      collection: "users",
      where: { email: { equals: LEGACY_ADMIN_EMAIL } },
      limit: 1,
    });
    const legacyDoc = byLegacyEmail.docs[0];
    if (legacyDoc) {
      doc = await payload.update({
        collection: "users",
        id: legacyDoc.id,
        data: { email: ADMIN_EMAIL, role: "admin" },
      });
      return `Email admin migré : ${LEGACY_ADMIN_EMAIL} → ${ADMIN_EMAIL}`;
    }
  }

  if (doc && doc.role !== "admin") {
    await payload.update({
      collection: "users",
      id: doc.id,
      data: { role: "admin" },
    });
    return `Role admin confirmé pour ${ADMIN_EMAIL}`;
  }

  return null;
}
