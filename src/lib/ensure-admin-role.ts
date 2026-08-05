import type { Payload } from "payload";

import { getAdminEmails } from "@/lib/admin-auth";

const LEGACY_ADMIN_EMAIL = "admin@cinemergence.paris";

/**
 * S'assure que chaque email de `ADMIN_LIST` a bien `role: "admin"` en base.
 * Migre aussi l'ancien email de seed local (`admin@cinemergence.paris`) vers
 * le premier email de la whitelist, pour que clerk-strategy le retrouve.
 */
export async function ensureAdminRole(payload: Payload): Promise<string | null> {
  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) {
    return "ADMIN_LIST vide — aucun rôle admin forcé";
  }

  const logs: string[] = [];
  const primaryEmail = adminEmails[0]!;

  const byLegacyEmail = await payload.find({
    collection: "users",
    where: { email: { equals: LEGACY_ADMIN_EMAIL } },
    limit: 1,
  });
  const legacyDoc = byLegacyEmail.docs[0];
  if (legacyDoc) {
    const existingPrimary = await payload.find({
      collection: "users",
      where: { email: { equals: primaryEmail } },
      limit: 1,
    });
    if (!existingPrimary.docs[0]) {
      await payload.update({
        collection: "users",
        id: legacyDoc.id,
        data: { email: primaryEmail, role: "admin" },
      });
      logs.push(`Email admin migré : ${LEGACY_ADMIN_EMAIL} → ${primaryEmail}`);
    }
  }

  for (const email of adminEmails) {
    const found = await payload.find({
      collection: "users",
      where: { email: { equals: email } },
      limit: 1,
    });
    const doc = found.docs[0];
    if (!doc) continue;
    if (doc.role !== "admin") {
      await payload.update({
        collection: "users",
        id: doc.id,
        data: { role: "admin" },
      });
      logs.push(`Role admin confirmé pour ${email}`);
    }
  }

  return logs.length > 0 ? logs.join(" · ") : null;
}
