import type { ContactInput } from "@/lib/validations";

const TYPE_LABELS: Record<ContactInput["type"], string> = {
  contact: "Contact général",
  inscription: "Inscription formation",
  financement: "Demande financement",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendContactNotification(
  data: ContactInput,
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const to = process.env.CONTACT_NOTIFICATION_EMAIL?.trim();

  if (!to) {
    console.warn("[contact-notify] CONTACT_NOTIFICATION_EMAIL not set");
    return { ok: false, skipped: true, error: "missing_recipient" };
  }

  if (!apiKey) {
    console.warn("[contact-notify] BREVO_API_KEY not set — notification email skipped");
    return { ok: false, skipped: true, error: "missing_api_key" };
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim() || to;
  const senderName = process.env.BREVO_SENDER_NAME?.trim() || "Cinémergence";

  const phoneLine = data.telephone
    ? `<p><strong>Téléphone :</strong> ${escapeHtml(data.telephone)}</p>`
    : "";
  const formationLine = data.formationSlug
    ? `<p><strong>Formation :</strong> ${escapeHtml(data.formationSlug)}</p>`
    : "";

  const html = `
    <h2>Nouvelle demande — ${TYPE_LABELS[data.type]}</h2>
    <p><strong>Nom :</strong> ${escapeHtml(data.nom)}</p>
    <p><strong>Email :</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></p>
    ${phoneLine}
    ${formationLine}
    <p><strong>Message :</strong></p>
    <p>${escapeHtml(data.message).replace(/\n/g, "<br>")}</p>
  `.trim();

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: to }],
        replyTo: { email: data.email, name: data.nom },
        subject: `[Cinémergence] ${TYPE_LABELS[data.type]} — ${data.nom}`,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("[contact-notify] Brevo error", response.status, body);
      return { ok: false, error: body };
    }

    return { ok: true };
  } catch (error) {
    console.error("[contact-notify]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "send_failed",
    };
  }
}
