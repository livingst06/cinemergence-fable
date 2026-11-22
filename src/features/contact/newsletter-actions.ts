"use server";

import type { FormState } from "@/features/contact/form-state";
import { createFormSubmission } from "@/lib/form-submissions";
import { newsletterSchema } from "@/lib/validations";

export async function submitNewsletter(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const raw = {
    email: String(formData.get("email") ?? ""),
    website: String(formData.get("website") ?? ""),
  };

  const parsed = newsletterSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "validation",
      message: parsed.error.issues[0]?.message ?? "Email invalide",
    };
  }

  if (parsed.data.website) {
    return {
      status: "success",
      message: "Inscription enregistrée. À très bientôt.",
    };
  }

  try {
    await createFormSubmission({
      type: "newsletter",
      email: parsed.data.email,
      payload: parsed.data,
    });
  } catch (error) {
    console.error("[newsletter]", error);
    return {
      status: "error",
      message: "Inscription impossible pour le moment. Réessaie plus tard.",
    };
  }

  return {
    status: "success",
    message: "Inscription enregistrée. À très bientôt.",
  };
}
