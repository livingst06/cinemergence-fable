import { describe, expect, it } from "vitest";

import { submitContact } from "@/features/contact/actions";
import { initialFormState } from "@/features/contact/form-state";
import { submitNewsletter } from "@/features/contact/newsletter-actions";

describe("submitContact", () => {
  it("returns validation status for invalid email", async () => {
    const formData = new FormData();
    formData.set("nom", "Test User");
    formData.set("email", "not-an-email");
    formData.set("message", "Message de test valide");
    formData.set("type", "contact");

    const result = await submitContact(initialFormState, formData);

    expect(result.status).toBe("validation");
    expect(result.message).toMatch(/email/i);
  });

  it("returns validation status for short message", async () => {
    const formData = new FormData();
    formData.set("nom", "Test User");
    formData.set("email", "test@example.com");
    formData.set("message", "court");
    formData.set("type", "contact");

    const result = await submitContact(initialFormState, formData);

    expect(result.status).toBe("validation");
    expect(result.message).toMatch(/message/i);
  });
});

describe("submitNewsletter", () => {
  it("returns validation status for invalid email", async () => {
    const formData = new FormData();
    formData.set("email", "invalid");

    const result = await submitNewsletter(initialFormState, formData);

    expect(result.status).toBe("validation");
    expect(result.message).toMatch(/email/i);
  });
});
