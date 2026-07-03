"use server";

import { contactSchema } from "@/lib/validations";
import { getPayloadClient } from "@/lib/payload";

type FormState = {
  success: boolean;
  message: string;
};

export async function submitContact(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const raw = {
    nom: String(formData.get("nom") ?? ""),
    email: String(formData.get("email") ?? ""),
    telephone: String(formData.get("telephone") ?? "") || undefined,
    message: String(formData.get("message") ?? ""),
    formationSlug: String(formData.get("formationSlug") ?? "") || undefined,
    type: String(formData.get("type") ?? "contact") as "contact" | "inscription" | "financement",
    website: String(formData.get("website") ?? ""),
  };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  if (parsed.data.website) {
    return { success: true, message: "Message envoyé. On te répond rapidement." };
  }

  try {
    const payload = await getPayloadClient();
    await payload.create({
      collection: "form-submissions",
      data: {
        type: parsed.data.type,
        email: parsed.data.email,
        nom: parsed.data.nom,
        telephone: parsed.data.telephone,
        message: parsed.data.message,
        formationSlug: parsed.data.formationSlug,
        payload: parsed.data,
      },
    });
  } catch (error) {
    console.error("[contact]", error);
  }

  // Brancher email transactionnel via CONTACT_NOTIFICATION_EMAIL
  return {
    success: true,
    message: "Message envoyé. On te répond rapidement à " + parsed.data.email + ".",
  };
}
