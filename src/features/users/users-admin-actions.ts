"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { isAdminEmail } from "@/lib/admin-auth";
import { getPool } from "@/lib/db";
import { normalizePayerEmail, normalizePayerPhone } from "@/lib/payer-user";
import { requireAdmin } from "@/lib/session-profile";

const userFieldsSchema = z.object({
  name: z.string().trim().max(120).optional().default(""),
  email: z.string().trim().email("E-mail invalide"),
  phone: z.string().trim().max(40).optional().default(""),
  role: z.enum(["eleve", "formateur", "intervenant"]),
});

export type UserFieldsInput = z.infer<typeof userFieldsSchema>;

function revalidateUserPaths() {
  revalidatePath("/les-utilisateurs");
  revalidatePath("/les-sessions");
  revalidatePath("/mes-sessions");
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error != null && "code" in error && error.code === "23505";
}

function isForeignKeyViolation(error: unknown): boolean {
  return typeof error === "object" && error != null && "code" in error && error.code === "23503";
}

export async function createUserAction(
  input: UserFieldsInput,
): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
  const gate = await requireAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };
  const parsed = userFieldsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }
  const email = normalizePayerEmail(parsed.data.email);
  if (!email) return { ok: false, error: "E-mail invalide" };
  if (isAdminEmail(email)) {
    return { ok: false, error: "Cet e-mail est réservé à un admin." };
  }

  try {
    await getPool().query(
      `INSERT INTO users (email, name, phone, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4::enum_users_role, now(), now())`,
      [
        email,
        parsed.data.name || null,
        normalizePayerPhone(parsed.data.phone),
        parsed.data.role,
      ],
    );
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, error: "Un compte existe déjà avec cet e-mail." };
    }
    console.error("[users] create", error);
    return { ok: false, error: "Création impossible." };
  }

  revalidateUserPaths();
  return { ok: true, message: "Utilisateur créé." };
}

export async function updateUserAction(
  userId: number | string,
  input: UserFieldsInput,
): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
  const gate = await requireAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };
  const parsed = userFieldsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }
  const email = normalizePayerEmail(parsed.data.email);
  if (!email) return { ok: false, error: "E-mail invalide" };

  const current = await getPool().query<{ id: number; email: string; role: string }>(
    "SELECT id, email, role::text FROM users WHERE id = $1",
    [userId],
  );
  const row = current.rows[0];
  if (!row) return { ok: false, error: "Compte introuvable" };

  const lockedAdmin = isAdminEmail(row.email);
  if (lockedAdmin && email !== normalizePayerEmail(row.email)) {
    return { ok: false, error: "L'e-mail d'un admin ne se modifie pas ici." };
  }
  if (!lockedAdmin && isAdminEmail(email)) {
    return { ok: false, error: "Cet e-mail est réservé à un admin." };
  }

  const role = lockedAdmin ? row.role : parsed.data.role;
  try {
    await getPool().query(
      `UPDATE users
       SET email = $2, name = $3, phone = $4, role = $5::enum_users_role, updated_at = now()
       WHERE id = $1`,
      [row.id, email, parsed.data.name || null, normalizePayerPhone(parsed.data.phone), role],
    );
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, error: "Un compte existe déjà avec cet e-mail." };
    }
    console.error("[users] update", error);
    return { ok: false, error: "Modification impossible." };
  }

  revalidateUserPaths();
  return { ok: true, message: "Utilisateur mis à jour." };
}

export async function deleteUserAction(
  userId: number | string,
): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
  const gate = await requireAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };

  const current = await getPool().query<{ id: number; email: string }>(
    "SELECT id, email FROM users WHERE id = $1",
    [userId],
  );
  const row = current.rows[0];
  if (!row) return { ok: false, error: "Compte introuvable" };
  if (isAdminEmail(row.email)) {
    return { ok: false, error: "Un admin ne se supprime pas ici." };
  }
  if (
    gate.profile.payloadUserId != null &&
    String(gate.profile.payloadUserId) === String(row.id)
  ) {
    return { ok: false, error: "Tu ne peux pas supprimer ton propre compte." };
  }

  const pool = getPool();
  try {
    await pool.query("UPDATE paiements SET user_id = NULL WHERE user_id = $1", [row.id]);
    await pool.query("DELETE FROM users WHERE id = $1", [row.id]);
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      return {
        ok: false,
        error: "Ce compte est encore lié à une session, une inscription ou un message.",
      };
    }
    console.error("[users] delete", error);
    return { ok: false, error: "Suppression impossible." };
  }

  revalidateUserPaths();
  return { ok: true, message: "Utilisateur supprimé." };
}
