import "server-only";

import type { Payload } from "payload";

import { isAvatarKey } from "@/lib/avatars";
import { ensureUsersRoleEnum } from "@/lib/ensure-user-roles";
import { getPayloadClient } from "@/lib/payload";

export async function ensureUsersAvatarKeyColumn(payload: Payload): Promise<void> {
  const pool = payload.db.pool;
  if (!pool) return;
  await pool.query(
    `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_key varchar`,
  );
  await ensureUsersRoleEnum(payload);
}

export async function updateUserAvatarKey(
  payloadUserId: number | string,
  avatarKey: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isAvatarKey(avatarKey)) {
    return { ok: false, error: "Avatar inconnu" };
  }
  const payload = await getPayloadClient();
  await ensureUsersAvatarKeyColumn(payload);
  const pool = payload.db.pool;
  if (!pool) {
    return { ok: false, error: "Enregistrement impossible pour le moment" };
  }

  const id = Number(payloadUserId);
  if (!Number.isInteger(id)) {
    return { ok: false, error: "Compte introuvable" };
  }

  try {
    // SQL direct : payload.update revalide tout le doc users.
    const result = await pool.query(
      `UPDATE public.users SET avatar_key = $1, updated_at = NOW() WHERE id = $2`,
      [avatarKey, id],
    );
    if (!result.rowCount) {
      return { ok: false, error: "Compte introuvable" };
    }
    return { ok: true };
  } catch (error) {
    console.error("[profile] avatar", error);
    return { ok: false, error: "Enregistrement impossible pour le moment" };
  }
}
