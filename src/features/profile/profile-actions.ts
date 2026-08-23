"use server";

import { revalidatePath } from "next/cache";

import { ensurePayloadUserForClerk } from "@/lib/ensure-payload-user";
import { updateUserAvatarKey } from "@/lib/profile";
import { requireAuth } from "@/lib/session-profile";

export async function updateProfileAvatar(
  avatarKey: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAuth();
  if (!auth.ok) return { ok: false, error: auth.error };

  let payloadUserId = auth.profile.payloadUserId;
  if (!payloadUserId) {
    const user = await ensurePayloadUserForClerk();
    payloadUserId = user?.id ?? null;
  }
  if (!payloadUserId) {
    return { ok: false, error: "Connexion requise" };
  }

  const result = await updateUserAvatarKey(payloadUserId, avatarKey);
  if (!result.ok) return result;

  revalidatePath("/mon-profil");
  revalidatePath("/", "layout");
  return { ok: true };
}
