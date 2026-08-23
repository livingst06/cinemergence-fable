export const USER_ROLES = ["admin", "formateur", "intervenant", "eleve"] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** Priorité si un email est sur plusieurs listes. */
const ROLE_PRIORITY: readonly UserRole[] = [
  "admin",
  "formateur",
  "intervenant",
  "eleve",
];

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function parseEmailList(raw: string | undefined): string[] {
  if (!raw) return [];
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
        .map(normalizeEmail),
    ),
  );
}

export function isUserRole(value: unknown): value is UserRole {
  return (
    typeof value === "string" && (USER_ROLES as readonly string[]).includes(value)
  );
}

export function emailMatchesList(
  email: string | null | undefined,
  emails: readonly string[],
): boolean {
  if (!email || emails.length === 0) return false;
  const normalized = normalizeEmail(email);
  return emails.some((candidate) => candidate === normalized);
}

export function getAdminEmails(): string[] {
  return parseEmailList(process.env.ADMIN_LIST);
}

export function getIntervenantEmails(): string[] {
  return parseEmailList(process.env.INTERVENANT_LIST);
}

export function getFormateurEmails(): string[] {
  return parseEmailList(process.env.FORMATEUR_LIST);
}

export function emailMatchesAdminList(
  email: string | null | undefined,
  adminEmails: readonly string[],
): boolean {
  return emailMatchesList(email, adminEmails);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  return emailMatchesList(email, getAdminEmails());
}

export function anyEmailIsAdmin(
  emails: readonly (string | null | undefined)[],
): boolean {
  const adminEmails = getAdminEmails();
  return emails.some((email) => emailMatchesList(email, adminEmails));
}

export function isFormateurEmail(email: string | null | undefined): boolean {
  return emailMatchesList(email, getFormateurEmails());
}

export function isIntervenantEmail(email: string | null | undefined): boolean {
  return emailMatchesList(email, getIntervenantEmails());
}

export function anyEmailIsFormateur(
  emails: readonly (string | null | undefined)[],
): boolean {
  const list = getFormateurEmails();
  return emails.some((email) => emailMatchesList(email, list));
}

export function anyEmailIsIntervenant(
  emails: readonly (string | null | undefined)[],
): boolean {
  const list = getIntervenantEmails();
  return emails.some((email) => emailMatchesList(email, list));
}

function firstMatchingRole(
  emails: readonly (string | null | undefined)[],
): UserRole {
  const lists: Record<Exclude<UserRole, "eleve">, string[]> = {
    admin: getAdminEmails(),
    formateur: getFormateurEmails(),
    intervenant: getIntervenantEmails(),
  };
  for (const role of ROLE_PRIORITY) {
    if (role === "eleve") return "eleve";
    if (emails.some((email) => emailMatchesList(email, lists[role]))) {
      return role;
    }
  }
  return "eleve";
}

/** Élève par défaut ; whitelist admin / formateur / intervenant sinon. */
export function roleForEmail(email: string | null | undefined): UserRole {
  return firstMatchingRole([email]);
}

export function roleForEmails(
  emails: readonly (string | null | undefined)[],
): UserRole {
  return firstMatchingRole(emails);
}
