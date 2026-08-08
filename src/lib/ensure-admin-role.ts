import type { Payload } from "payload";

import { getAdminEmails } from "@/lib/admin-auth";

/**
 * Aligne les rôles Payload `users` sur `ADMIN_LIST` (env Clerk / Vercel / Supabase).
 * Aucun email hardcodé : seuls les emails de la whitelist deviennent admin ;
 * les autres comptes `admin` hors liste sont rétrogradés en stagiaire.
 */
export async function ensureAdminRole(payload: Payload): Promise<string | null> {
  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) {
    return "ADMIN_LIST vide — aucun rôle admin forcé";
  }

  const logs: string[] = [];
  const adminSet = new Set(adminEmails);

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

  const adminsInDb = await payload.find({
    collection: "users",
    where: { role: { equals: "admin" } },
    limit: 100,
  });

  for (const doc of adminsInDb.docs) {
    const email = typeof doc.email === "string" ? doc.email.trim().toLowerCase() : "";
    if (!email || adminSet.has(email)) continue;
    await payload.update({
      collection: "users",
      id: doc.id,
      data: { role: "stagiaire" },
    });
    logs.push(`Role stagiaire pour ${email} (hors ADMIN_LIST)`);
  }

  return logs.length > 0 ? logs.join(" · ") : null;
}
