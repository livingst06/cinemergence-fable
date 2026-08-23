export const USER_ROLES = ["admin", "formateur", "intervenant", "eleve"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ASSIGNABLE_ROLES = ["eleve", "formateur", "intervenant"] as const;
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

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

export function isAssignableRole(value: unknown): value is AssignableRole {
  return (
    typeof value === "string" &&
    (ASSIGNABLE_ROLES as readonly string[]).includes(value)
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

/** Rôle à la création : admin si whitelist, élève sinon. */
export function roleForNewUser(email: string | null | undefined): UserRole {
  return isAdminEmail(email) ? "admin" : "eleve";
}

/** @deprecated préfère `roleForNewUser` — admin ou élève uniquement. */
export function roleForEmail(email: string | null | undefined): UserRole {
  return roleForNewUser(email);
}

export function roleForEmails(
  emails: readonly (string | null | undefined)[],
): UserRole {
  return anyEmailIsAdmin(emails) ? "admin" : "eleve";
}

/**
 * Sync d’un compte existant : n’aligne que le flag admin.
 * formateur / intervenant / élève restent tels quels.
 */
export function syncedRoleForExistingUser(
  email: string | null | undefined,
  currentRole: unknown,
): UserRole {
  if (isAdminEmail(email)) return "admin";
  if (isAssignableRole(currentRole)) return currentRole;
  return "eleve";
}

export function resolveSessionRole(
  isAdminEligible: boolean,
  dbRole: unknown,
): UserRole {
  if (isAdminEligible) return "admin";
  if (isAssignableRole(dbRole)) return dbRole;
  return "eleve";
}
