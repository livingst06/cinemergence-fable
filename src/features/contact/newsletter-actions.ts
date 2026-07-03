"use server";

import { newsletterSchema } from "@/lib/validations";
import { getPayloadClient } from "@/lib/payload";

type FormState = {
  success: boolean;
  message: string;
};

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
    return { success: false, message: parsed.error.issues[0]?.message ?? "Email invalide" };
  }

  if (parsed.data.website) {
    return { success: true, message: "Inscription enregistrée." };
  }

  try {
    const payload = await getPayloadClient();
    await payload.create({
      collection: "form-submissions",
      data: {
        type: "newsletter",
        email: parsed.data.email,
        payload: parsed.data,
      },
    });
  } catch (error) {
    console.error("[newsletter]", error);
  }

  // Brancher Brevo via BREVO_API_KEY + BREVO_LIST_ID
  return { success: true, message: "Inscription enregistrée. À très bientôt." };
}
