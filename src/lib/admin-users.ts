import "server-only";

import { isAdminEmail } from "@/lib/admin-auth";
import { getPayloadClient } from "@/lib/payload";
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
};

export async function listLoggedInUsers(): Promise<AdminUserRow[]> {
  try {
    const payload = await getPayloadClient();
    const found = await payload.find({
      collection: "users",
      limit: 500,
      sort: "email",
      overrideAccess: true,
    });

    const rows: AdminUserRow[] = [];
    for (const doc of found.docs) {
      const clerkId = typeof doc.clerkId === "string" ? doc.clerkId.trim() : "";
      if (!clerkId) continue;
      const email = typeof doc.email === "string" ? doc.email.trim() : "";
      if (!email) continue;
      const role = isUserRole(doc.role) ? doc.role : "eleve";
      const isEnvAdmin = isAdminEmail(email);
      rows.push({
        id: doc.id,
        name: typeof doc.name === "string" ? doc.name.trim() : "",
        email,
        role: isEnvAdmin ? "admin" : role === "admin" ? "eleve" : role,
        assignableRole: isAssignableRole(role) ? role : "eleve",
        isEnvAdmin,
        avatarKey:
          typeof doc.avatarKey === "string" && doc.avatarKey.trim()
            ? doc.avatarKey.trim()
            : null,
      });
    }
    return rows;
  } catch {
    return [];
  }
}
