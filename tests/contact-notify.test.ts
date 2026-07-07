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

import { sendContactNotification } from "@/lib/contact-notify";

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
    vi.stubEnv("CONTACT_NOTIFICATION_EMAIL", "verdat.sylvain@gmail.com");
    vi.stubEnv("BREVO_API_KEY", "");

    const result = await sendContactNotification({
      nom: "Jean Test",
      email: "jean@example.com",
      message: "Message de test valide",
      type: "contact",
    });

    expect(result.ok).toBe(false);
    expect(result.skipped).toBe(true);
  });

  it("sends via Brevo REST when key is xkeysib", async () => {
    vi.stubEnv("BREVO_API_KEY", "xkeysib-test-key");
    vi.stubEnv("CONTACT_NOTIFICATION_EMAIL", "verdat.sylvain@gmail.com");

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
    expect(createTransportMock).not.toHaveBeenCalled();
  });

  it("fails when xsmtpsib key but BREVO_SMTP_LOGIN is missing", async () => {
    vi.stubEnv("BREVO_API_KEY", "xsmtpsib-test-key");
    vi.stubEnv("CONTACT_NOTIFICATION_EMAIL", "verdat.sylvain@gmail.com");

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
    vi.stubEnv("CONTACT_NOTIFICATION_EMAIL", "verdat.sylvain@gmail.com");
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
      to: "verdat.sylvain@gmail.com",
      replyTo: '"Jean Test" <jean@example.com>',
    });
  });
});
