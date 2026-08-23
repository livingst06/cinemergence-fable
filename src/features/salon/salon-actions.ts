"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { FormState } from "@/features/contact/form-state";
import { ensurePayloadUserForClerk } from "@/lib/ensure-payload-user";
import { SALON_POST_MAX_LENGTH } from "@/lib/salon-constants";
import { createSalonPostForUser } from "@/lib/session-salon";
import { requireAuth } from "@/lib/session-profile";

const postSchema = z.object({
  salonId: z.string().trim().min(1, "Salon manquant"),
  body: z
    .string()
    .trim()
    .min(1, "Écris un message")
    .max(SALON_POST_MAX_LENGTH, "Message trop long (2000 caractères max)"),
});

export async function createSalonPost(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const auth = await requireAuth();
  if (!auth.ok) {
    return { status: "error", message: auth.error };
  }

  const parsed = postSchema.safeParse({
    salonId: String(formData.get("salonId") ?? ""),
    body: String(formData.get("body") ?? ""),
  });
  if (!parsed.success) {
    return {
      status: "validation",
      message: parsed.error.issues[0]?.message ?? "Données invalides",
    };
  }

  let payloadUserId = auth.profile.payloadUserId;
  if (!payloadUserId) {
    const user = await ensurePayloadUserForClerk();
    payloadUserId = user?.id ?? null;
  }
  if (!payloadUserId) {
    return { status: "error", message: "Connexion requise" };
  }

  const emails = [
    auth.profile.email,
    ...(auth.profile.clerkUser?.emailAddresses.map(
      (entry) => entry.emailAddress,
    ) ?? []),
  ].filter((value): value is string => Boolean(value));

  const result = await createSalonPostForUser({
    salonId: parsed.data.salonId,
    body: parsed.data.body,
    payloadUserId,
    email: auth.profile.email,
    emails,
  });

  if (!result.ok) {
    return { status: "error", message: result.error };
  }

  revalidatePath(`/mes-reservations/salon/${parsed.data.salonId}`);
  revalidatePath(`/mes-sessions/salon/${parsed.data.salonId}`);
  revalidatePath("/mes-reservations");
  revalidatePath("/mes-sessions");
  return { status: "success", message: "Message publié" };
}
