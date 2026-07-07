import { afterEach, describe, expect, it, vi } from "vitest";

import { sendContactNotification } from "@/lib/contact-notify";

describe("sendContactNotification", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.BREVO_API_KEY;
    delete process.env.CONTACT_NOTIFICATION_EMAIL;
  });

  it("skips when BREVO_API_KEY is missing", async () => {
    process.env.CONTACT_NOTIFICATION_EMAIL = "verdat.sylvain@gmail.com";

    const result = await sendContactNotification({
      nom: "Jean Test",
      email: "jean@example.com",
      message: "Message de test valide",
      type: "contact",
    });

    expect(result.ok).toBe(false);
    expect(result.skipped).toBe(true);
  });

  it("sends via Brevo when configured", async () => {
    process.env.BREVO_API_KEY = "test-key";
    process.env.CONTACT_NOTIFICATION_EMAIL = "verdat.sylvain@gmail.com";

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
    expect(init?.headers).toMatchObject({ "api-key": "test-key" });
  });
});
