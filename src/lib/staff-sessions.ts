import "server-only";

import type { AdminSessionGroup } from "@/features/inscriptions/AdminDemandesPanel";
import { listAdminSessionGroups } from "@/lib/admin-sessions";
import { getPayloadClient } from "@/lib/payload";
import {
  sessionMatchesStaff,
  type StaffKind,
} from "@/lib/staff-session-match";

export type { StaffKind };
export { sessionMatchesStaff };

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function findIntervenantIdsForEmails(
  emails: readonly string[],
): Promise<Set<string>> {
  const wanted = new Set(
    emails.map((email) => normalizeEmail(email)).filter(Boolean),
  );
  if (wanted.size === 0) return new Set();

  const payload = await getPayloadClient();
  const found = await payload.find({
    collection: "intervenants",
    limit: 200,
    depth: 0,
    overrideAccess: true,
  });

  const ids = new Set<string>();
  for (const doc of found.docs) {
    const email = typeof doc.email === "string" ? normalizeEmail(doc.email) : "";
    if (email && wanted.has(email)) ids.add(String(doc.id));
  }
  return ids;
}

/** Sessions CMS où l’email est assigné comme formateur ou intervenant. */
export async function listSessionGroupsForStaff(
  emails: readonly string[],
  kind: StaffKind,
): Promise<AdminSessionGroup[]> {
  const [groups, staffIds] = await Promise.all([
    listAdminSessionGroups(),
    findIntervenantIdsForEmails(emails),
  ]);
  return groups.filter((group) =>
    sessionMatchesStaff(group, staffIds, emails, kind),
  );
}
