export type StaffKind = "formateur" | "intervenant";

export type StaffPerson = {
  id: number | string;
  email: string | null;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function mapStaffPeople(raw: unknown): StaffPerson[] {
  if (!Array.isArray(raw)) return [];
  const out: StaffPerson[] = [];
  for (const item of raw) {
    if (typeof item === "object" && item && "id" in item) {
      const doc = item as { id: number | string; email?: string | null };
      const email =
        typeof doc.email === "string" && doc.email.trim()
          ? doc.email.trim()
          : null;
      out.push({ id: doc.id, email });
      continue;
    }
    if (typeof item === "number" || typeof item === "string") {
      out.push({ id: item, email: null });
    }
  }
  return out;
}

export function sessionHasAssignedUser(
  group: { formateurs: StaffPerson[]; intervenants: StaffPerson[] },
  userId: number | string | null,
  emails: readonly string[] = [],
): boolean {
  const staffIds = new Set(
    userId != null && String(userId).trim() ? [String(userId)] : [],
  );
  return (
    sessionMatchesStaff(group, staffIds, emails, "formateur") ||
    sessionMatchesStaff(group, staffIds, emails, "intervenant")
  );
}

export function sessionMatchesStaff(
  group: { formateurs: StaffPerson[]; intervenants: StaffPerson[] },
  staffIds: ReadonlySet<string>,
  emails: readonly string[],
  kind: StaffKind,
): boolean {
  const people = kind === "formateur" ? group.formateurs : group.intervenants;
  const emailSet = new Set(
    emails.map((email) => normalizeEmail(email)).filter(Boolean),
  );
  return people.some((person) => {
    if (staffIds.has(String(person.id))) return true;
    const email = person.email ? normalizeEmail(person.email) : "";
    return Boolean(email && emailSet.has(email));
  });
}
