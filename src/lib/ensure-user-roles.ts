import type { Payload } from "payload";

import {
  isUserRole,
  syncedRoleForExistingUser,
  type UserRole,
} from "@/lib/user-roles";

const ROLE_ENUM_VALUES: readonly UserRole[] = [
  "admin",
  "formateur",
  "intervenant",
  "eleve",
];

async function addEnumValue(
  pool: { query: (sql: string) => Promise<unknown> },
  value: string,
): Promise<void> {
  await pool.query(
    `ALTER TYPE enum_users_role ADD VALUE IF NOT EXISTS '${value}'`,
  );
}

/** Ajoute les valeurs d’enum manquantes et remplace l’ancien rôle « stagiaire ». */
export async function ensureUsersRoleEnum(payload: Payload): Promise<void> {
  const pool = payload.db.pool;
  if (!pool) return;

  for (const value of ROLE_ENUM_VALUES) {
    try {
      await addEnumValue(pool, value);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!/already exists|duplicate/i.test(message)) {
        console.error("[user-roles] enum", value, error);
      }
    }
  }

  await pool.query(
    `UPDATE public.users SET role = 'eleve' WHERE role::text = 'stagiaire'`,
  );
}

/**
 * Aligne uniquement le flag admin sur `ADMIN_LIST`.
 * Ne touche pas aux rôles formateur / intervenant / élève.
 */
export async function ensureUserRoles(payload: Payload): Promise<string | null> {
  await ensureUsersRoleEnum(payload);

  const found = await payload.find({
    collection: "users",
    limit: 500,
    overrideAccess: true,
  });

  const logs: string[] = [];
  for (const doc of found.docs) {
    const email = typeof doc.email === "string" ? doc.email : null;
    const desired = syncedRoleForExistingUser(email, doc.role);
    const current = isUserRole(doc.role) ? doc.role : null;
    if (current === desired) continue;

    await payload.update({
      collection: "users",
      id: doc.id,
      data: { role: desired },
      overrideAccess: true,
    });
    logs.push(`${email ?? doc.id}: ${current ?? "?"} → ${desired}`);
  }

  return logs.length > 0 ? logs.join(" · ") : null;
}

/** @deprecated préfère `ensureUserRoles` */
export async function ensureAdminRole(payload: Payload): Promise<string | null> {
  return ensureUserRoles(payload);
}
