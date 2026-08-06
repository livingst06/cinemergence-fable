"use server";

import type { FormState } from "@/features/contact/form-state";
import { sendContactNotification } from "@/lib/contact-notify";
import { ensurePayloadUserForClerk } from "@/lib/ensure-payload-user";
import { contactSchema } from "@/lib/validations";
import { getPayloadClient } from "@/lib/payload";

async function upsertInscriptionDemande(opts: {
  userId: number | string;
  formationSlug: string;
  codeParrainage?: string;
  message?: string;
}) {
  const payload = await getPayloadClient();
  const formation = await payload.find({
    collection: "formations",
    where: { slug: { equals: opts.formationSlug } },
    limit: 1,
  });
  const formationDoc = formation.docs[0];
  if (!formationDoc) return;

  const existing = await payload.find({
    collection: "inscriptions",
    where: {
      and: [
        { user: { equals: opts.userId } },
        { formation: { equals: formationDoc.id } },
      ],
    },
    limit: 1,
  });

  const data = {
    user: opts.userId,
    formation: formationDoc.id,
    codeParrainage: opts.codeParrainage,
    message: opts.message,
  };

  if (existing.docs[0]) {
    // Ne pas écraser une inscription déjà traitée
    const status = String(existing.docs[0].status);
    if (status === "demande" || status === "en_instruction") {
      await payload.update({
        collection: "inscriptions",
        id: existing.docs[0].id,
        data: { ...data, status: "en_instruction" },
        overrideAccess: true,
      });
    }
    return;
  }

  await payload.create({
    collection: "inscriptions",
    data: { ...data, status: "en_instruction" },
    overrideAccess: true,
  });
}

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
    codeParrainage: String(formData.get("codeParrainage") ?? "") || undefined,
    type: String(formData.get("type") ?? "contact") as "contact" | "inscription" | "financement",
    website: String(formData.get("website") ?? ""),
  };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "validation",
      message: parsed.error.issues[0]?.message ?? "Données invalides",
    };
  }

  if (parsed.data.website) {
    return {
      status: "success",
      message: "Message envoyé. On te répond rapidement.",
    };
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
        codeParrainage: parsed.data.codeParrainage,
        payload: parsed.data,
      },
    });

    if (parsed.data.type === "inscription" && parsed.data.formationSlug) {
      const user = await ensurePayloadUserForClerk();
      if (user) {
        await upsertInscriptionDemande({
          userId: user.id,
          formationSlug: parsed.data.formationSlug,
          codeParrainage: parsed.data.codeParrainage,
          message: parsed.data.message,
        });
      }
    }
  } catch (error) {
    console.error("[contact]", error);
    return {
      status: "error",
      message: "L'envoi a échoué. Réessaie dans un instant ou contacte-nous par email.",
    };
  }

  const mail = await sendContactNotification(parsed.data);
  if (!mail.ok && !mail.skipped) {
    return {
      status: "error",
      message: "Message enregistré, mais la notification email a échoué. Réessaie ou contacte-nous directement.",
    };
  }

  if (mail.skipped) {
    console.warn("[contact] Notification email skipped — configure BREVO_API_KEY on Vercel");
  }

  return {
    status: "success",
    message: "Message envoyé. On te répond rapidement.",
  };
}
