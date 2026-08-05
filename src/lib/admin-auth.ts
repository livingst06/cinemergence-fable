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

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const adminList = parseAdminList(process.env.ADMIN_LIST);
  if (adminList.size === 0) return false;
  return adminList.has(normalizeEmail(email));
}

export function roleForEmail(email: string | null | undefined): "admin" | "stagiaire" {
  return isAdminEmail(email) ? "admin" : "stagiaire";
}
