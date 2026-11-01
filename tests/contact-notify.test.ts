import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { sendMailMock, createTransportMock } = vi.hoisted(() => {
  const sendMailMock = vi.fn().mockResolvedValue({ messageId: "test-id" });
  const createTransportMock = vi.fn(() => ({
    sendMail: sendMailMock,
    close: vi.fn(),
  }));
  return { sendMailMock, createTransportMock };
});

vi.mock("nodemailer", () => ({
  default: {
    createTransport: createTransportMock,
  },
}));

import {
  BREVO_VERIFIED_SENDER,
  CONTACT_NOTIFICATION_INBOX,
  resolveContactNotificationEmail,
  resolveSenderEmail,
  sendContactNotification,
} from "@/lib/contact-notify";

const sample = {
  nom: "Jean Test",
  email: "jean@example.com",
  message: "Message de test valide",
  type: "contact" as const,
};

describe("resolveContactNotificationEmail", () => {
  it("uses the Cinémergence inbox by default", () => {
    expect(resolveContactNotificationEmail(undefined)).toBe(CONTACT_NOTIFICATION_INBOX);
    expect(resolveContactNotificationEmail("  ")).toBe(CONTACT_NOTIFICATION_INBOX);
  });

  it("redirects the former inboxes", () => {
    expect(resolveContactNotificationEmail("verdat.sylvain@gmail.com")).toBe(
      CONTACT_NOTIFICATION_INBOX,
    );
    expect(resolveContactNotificationEmail("  Verdat.Sylvain@gmail.com ")).toBe(
      CONTACT_NOTIFICATION_INBOX,
    );
    expect(resolveContactNotificationEmail("cinemergence.paris@gmail.com")).toBe(
      CONTACT_NOTIFICATION_INBOX,
    );
    expect(resolveContactNotificationEmail("cinemergence.paris.@gmail.com")).toBe(
      CONTACT_NOTIFICATION_INBOX,
    );
  });

  it("keeps any other configured recipient", () => {
    expect(resolveContactNotificationEmail("autre@example.com")).toBe("autre@example.com");
  });
});

describe("resolveSenderEmail", () => {
  it("uses the sender already declared in Brevo", () => {
    expect(resolveSenderEmail(undefined)).toBe(BREVO_VERIFIED_SENDER);
    expect(resolveSenderEmail("  ")).toBe(BREVO_VERIFIED_SENDER);
    expect(resolveSenderEmail("verdat.sylvain@gmail.com")).toBe(BREVO_VERIFIED_SENDER);
    expect(resolveSenderEmail("  Verdat.Sylvain@gmail.com ")).toBe(BREVO_VERIFIED_SENDER);
    expect(resolveSenderEmail(CONTACT_NOTIFICATION_INBOX)).toBe(BREVO_VERIFIED_SENDER);
    expect(resolveSenderEmail("cinemergence.paris@gmail.com")).toBe(BREVO_VERIFIED_SENDER);
    expect(resolveSenderEmail("cinemergence.paris.@gmail.com")).toBe(BREVO_VERIFIED_SENDER);
    expect(resolveSenderEmail("expediteur@example.com")).toBe("expediteur@example.com");
  });
});

describe("sendContactNotification", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    createTransportMock.mockClear();
    sendMailMock.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("skips when BREVO_API_KEY is missing", async () => {
    vi.stubEnv("CONTACT_NOTIFICATION_EMAIL", CONTACT_NOTIFICATION_INBOX);
    vi.stubEnv("BREVO_API_KEY", "");

    const result = await sendContactNotification(sample);

    expect(result.ok).toBe(false);
    expect(result.skipped).toBe(true);
  });

  it("sends via Brevo REST when key is xkeysib", async () => {
    vi.stubEnv("BREVO_API_KEY", "xkeysib-test-key");
    vi.stubEnv("CONTACT_NOTIFICATION_EMAIL", CONTACT_NOTIFICATION_INBOX);

    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response("{}", { status: 201 }),
    );

    const result = await sendContactNotification({
      nom: "Jean Test",
      email: "jean@example.com",
      message: "Message de test valide",
      type: "inscription",
      formationSlug: "formation-jouer-face-camera",
    });

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [, init] = fetchMock.mock.calls[0]!;
    expect(init?.headers).toMatchObject({ "api-key": "xkeysib-test-key" });
    expect(JSON.parse(String(init?.body))).toMatchObject({
      sender: { email: BREVO_VERIFIED_SENDER, name: "Cinémergence" },
      to: [{ email: CONTACT_NOTIFICATION_INBOX }],
    });
    expect(createTransportMock).not.toHaveBeenCalled();
  });

  it("fails when xsmtpsib key but BREVO_SMTP_LOGIN is missing", async () => {
    vi.stubEnv("BREVO_API_KEY", "xsmtpsib-test-key");
    vi.stubEnv("CONTACT_NOTIFICATION_EMAIL", "contact@cinemergence.fr");

    const result = await sendContactNotification({
      nom: "Jean Test",
      email: "jean@example.com",
      message: "Message de test valide",
      type: "contact",
    });

    expect(result.ok).toBe(false);
    expect(result.error).toBe("missing_smtp_login");
    expect(createTransportMock).not.toHaveBeenCalled();
  });

  it("sends via Brevo SMTP when key is xsmtpsib", async () => {
    vi.stubEnv("BREVO_API_KEY", "xsmtpsib-test-key");
    vi.stubEnv("CONTACT_NOTIFICATION_EMAIL", "contact@cinemergence.fr");
    vi.stubEnv("BREVO_SMTP_LOGIN", "123456@smtp-brevo.com");

    const fetchMock = vi.spyOn(global, "fetch");

    const result = await sendContactNotification({
      nom: "Jean Test",
      email: "jean@example.com",
      message: "Message de test valide",
      type: "contact",
    });

    expect(result.ok).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(createTransportMock).toHaveBeenCalledOnce();
    expect(sendMailMock).toHaveBeenCalledOnce();
    expect(sendMailMock.mock.calls[0]?.[0]).toMatchObject({
      to: CONTACT_NOTIFICATION_INBOX,
      from: `"Cinémergence" <${BREVO_VERIFIED_SENDER}>`,
      replyTo: '"Jean Test" <jean@example.com>',
    });
  });

  it("rewrites the legacy public gmail to contact@cinemergence.fr", async () => {
    vi.stubEnv("BREVO_API_KEY", "xsmtpsib-test-key");
    vi.stubEnv("CONTACT_NOTIFICATION_EMAIL", "cinemergence.paris@gmail.com");
    vi.stubEnv("BREVO_SENDER_EMAIL", "cinemergence.paris.@gmail.com");
    vi.stubEnv("BREVO_SMTP_LOGIN", "123456@smtp-brevo.com");

    const result = await sendContactNotification({
      nom: "Jean Test",
      email: "jean@example.com",
      message: "Message de test valide",
      type: "contact",
    });

    expect(result.ok).toBe(true);
    expect(sendMailMock.mock.calls[0]?.[0]).toMatchObject({
      to: "contact@cinemergence.fr",
      from: `"Cinémergence" <${BREVO_VERIFIED_SENDER}>`,
    });
  });
});
