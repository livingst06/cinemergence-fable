"use server";

import { isAdminEmail } from "@/lib/admin-auth";
import { getPayloadClient } from "@/lib/payload";
import { requireAdmin } from "@/lib/session-profile";
import { isAssignableRole, type AssignableRole } from "@/lib/user-roles";

export async function updateAssignableUserRole(
  userId: number | string,
  role: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const gate = await requireAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };
  if (!isAssignableRole(role)) {
    return { ok: false, error: "Rôle invalide" };
  }

  const payload = await getPayloadClient();
  let doc: { id: number | string; email?: string | null };
  try {
    doc = await payload.findByID({
      collection: "users",
      id: userId,
      depth: 0,
      overrideAccess: true,
    });
  } catch {
    return { ok: false, error: "Compte introuvable" };
  }

  const email = typeof doc.email === "string" ? doc.email : "";
  if (isAdminEmail(email)) {
    return { ok: false, error: "Le rôle admin est géré par ADMIN_LIST." };
  }

  await payload.update({
    collection: "users",
    id: doc.id,
    data: { role: role as AssignableRole },
    overrideAccess: true,
  });
  return { ok: true };
}
