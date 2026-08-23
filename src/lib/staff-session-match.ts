export type StaffKind = "formateur" | "intervenant";

type StaffPerson = {
  id: number | string;
  email: string | null;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
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
