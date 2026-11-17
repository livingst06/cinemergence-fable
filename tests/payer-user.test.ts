import { describe, expect, it } from "vitest";
import { normalizePayerEmail, normalizePayerPhone } from "@/lib/payer-user";

describe("normalizePayerEmail", () => {
  it("accepte un e-mail et ignore le reste", () => {
    expect(normalizePayerEmail("  Ada@Example.com ")).toBe("ada@example.com");
    expect(normalizePayerEmail("pas-un-email")).toBeNull();
    expect(normalizePayerEmail(null)).toBeNull();
    expect(normalizePayerPhone("  +33600000000  ")).toBe("+33600000000");
    expect(normalizePayerPhone("   ")).toBeNull();
  });
});
