function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function parseAdminList(raw: string | undefined): Set<string> {
  if (!raw) return new Set<string>();
  return new Set(
    raw
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .map(normalizeEmail),
  );
}

export function getAdminEmails(): string[] {
  return Array.from(parseAdminList(process.env.ADMIN_LIST));
}

export function emailMatchesAdminList(
  email: string | null | undefined,
  adminEmails: readonly string[],
): boolean {
  if (!email || adminEmails.length === 0) return false;
  const normalized = normalizeEmail(email);
  return adminEmails.some((candidate) => candidate === normalized);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  return emailMatchesAdminList(email, getAdminEmails());
}

export function anyEmailIsAdmin(
  emails: readonly (string | null | undefined)[],
): boolean {
  const adminEmails = getAdminEmails();
  return emails.some((email) => emailMatchesAdminList(email, adminEmails));
}

export function roleForEmail(email: string | null | undefined): "admin" | "stagiaire" {
  return isAdminEmail(email) ? "admin" : "stagiaire";
}
