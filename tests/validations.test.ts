import { describe, expect, it } from "vitest";

import { contactSchema, newsletterSchema } from "@/lib/validations";

describe("contactSchema", () => {
  it("accepts valid contact data", () => {
    const result = contactSchema.safeParse({
      nom: "Jean Dupont",
      email: "jean@example.com",
      message: "Je souhaite m'inscrire à une formation.",
      type: "contact",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = contactSchema.safeParse({
      nom: "Jean",
      email: "invalid",
      message: "Message valide assez long",
      type: "contact",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short message", () => {
    const result = contactSchema.safeParse({
      nom: "Jean",
      email: "jean@example.com",
      message: "court",
      type: "contact",
    });
    expect(result.success).toBe(false);
  });
});

describe("newsletterSchema", () => {
  it("accepts valid email", () => {
    const result = newsletterSchema.safeParse({ email: "test@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects honeypot fill", () => {
    const result = newsletterSchema.safeParse({
      email: "test@example.com",
      website: "spam",
    });
    expect(result.success).toBe(false);
  });
});
