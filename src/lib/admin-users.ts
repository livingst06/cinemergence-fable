import "server-only";

import { isAdminEmail } from "@/lib/admin-auth";
import { getPool } from "@/lib/db";
import { ensureUsersPhoneColumn } from "@/lib/payer-user";
import {
  isAssignableRole,
  isUserRole,
  type AssignableRole,
  type UserRole,
} from "@/lib/user-roles";

export type AdminUserRow = {
  id: number | string;
  name: string;
  email: string;
  role: UserRole;
  assignableRole: AssignableRole;
  isEnvAdmin: boolean;
  avatarKey: string | null;
  phone: string | null;
};

export async function listLoggedInUsers(): Promise<AdminUserRow[]> {
  try {
    await ensureUsersPhoneColumn();
    const found = await getPool().query<{
      id: number;
      email: string;
      name: string | null;
      role: string;
      avatar_key: string | null;
      phone: string | null;
    }>(
      `SELECT id, email, name, role::text, avatar_key, phone
       FROM users
       ORDER BY lower(email)
       LIMIT 500`,
    );

    const rows: AdminUserRow[] = [];
    for (const doc of found.rows) {
      const email = doc.email.trim();
      if (!email) continue;
      const role = isUserRole(doc.role) ? doc.role : "eleve";
      const isEnvAdmin = isAdminEmail(email);
      rows.push({
        id: doc.id,
        name: doc.name?.trim() ?? "",
        email,
        role: isEnvAdmin ? "admin" : role === "admin" ? "eleve" : role,
        assignableRole: isAssignableRole(role) ? role : "eleve",
        isEnvAdmin,
        avatarKey: doc.avatar_key?.trim() || null,
        phone: doc.phone?.trim() || null,
      });
    }
    return rows;
  } catch (error) {
    console.error("[admin-users]", error instanceof Error ? error.message : error);
    return [];
  }
}
