import { getPool } from "@/lib/db";
import { roleForNewUser } from "@/lib/user-roles";

export function normalizePayerEmail(email: string | null | undefined): string | null {
  const value = email?.trim().toLowerCase();
  if (!value || !value.includes("@")) return null;
  return value;
}

export function normalizePayerPhone(phone: string | null | undefined): string | null {
  const value = phone?.trim();
  return value || null;
}

/**
 * Retrouve l'élève par e-mail. S'il n'a jamais de compte, crée une ligne élève
 * avec le nom transmis par Stripe. Le premier login Clerk se rattache à cet e-mail.
 */
export async function ensurePayerUser(input: {
  email: string | null;
  name: string | null;
  phone?: string | null;
  userId?: number | null;
}): Promise<number | null> {
  const pool = getPool();
  const phone = normalizePayerPhone(input.phone);
  if (input.userId != null) {
    const existing = await pool.query<{ id: number; name: string | null; phone: string | null }>(
      "SELECT id, name, phone FROM users WHERE id = $1",
      [input.userId],
    );
    const row = existing.rows[0];
    if (row) {
      await fillBlankProfile(row.id, row, input.name, phone);
      return row.id;
    }
  }

  const email = normalizePayerEmail(input.email);
  if (!email) return null;
  const name = input.name?.trim() || null;

  const found = await pool.query<{ id: number; name: string | null; phone: string | null }>(
    "SELECT id, name, phone FROM users WHERE lower(email) = $1 LIMIT 1",
    [email],
  );
  const current = found.rows[0];
  if (current) {
    await fillBlankProfile(current.id, current, name, phone);
    return current.id;
  }

  try {
    const created = await pool.query<{ id: number }>(
      `INSERT INTO users (email, name, phone, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, now(), now())
       RETURNING id`,
      [email, name, phone, roleForNewUser(email)],
    );
    return created.rows[0]?.id ?? null;
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    if (code !== "23505") throw error;
    const again = await pool.query<{ id: number }>(
      "SELECT id FROM users WHERE lower(email) = $1 LIMIT 1",
      [email],
    );
    return again.rows[0]?.id ?? null;
  }
}

async function fillBlankProfile(
  id: number,
  current: { name: string | null; phone: string | null },
  name: string | null,
  phone: string | null,
) {
  const nextName = name?.trim() || null;
  const setName = Boolean(nextName && !current.name?.trim());
  const setPhone = Boolean(phone && !current.phone?.trim());
  if (!setName && !setPhone) return;
  await getPool().query(
    `UPDATE users
     SET name = CASE WHEN $2::text IS NOT NULL AND (name IS NULL OR btrim(name) = '') THEN $2 ELSE name END,
         phone = CASE WHEN $3::text IS NOT NULL AND (phone IS NULL OR btrim(phone) = '') THEN $3 ELSE phone END,
         updated_at = now()
     WHERE id = $1`,
    [id, setName ? nextName : null, setPhone ? phone : null],
  );
}
