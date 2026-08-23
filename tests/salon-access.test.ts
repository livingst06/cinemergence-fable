import { describe, expect, it } from "vitest";

import { isPaidEnrolledStatus } from "@/lib/inscription-status";

describe("isPaidEnrolledStatus", () => {
  it("autorise les places payées et les statuts inscrits legacy", () => {
    expect(isPaidEnrolledStatus("payee")).toBe(true);
    expect(isPaidEnrolledStatus("validee")).toBe(true);
    expect(isPaidEnrolledStatus("inscrit")).toBe(true);
  });

  it("refuse les inscriptions non confirmées", () => {
    expect(isPaidEnrolledStatus("en_paiement")).toBe(false);
    expect(isPaidEnrolledStatus("en_instruction")).toBe(false);
    expect(isPaidEnrolledStatus("refusee")).toBe(false);
    expect(isPaidEnrolledStatus("pieces_complementaires")).toBe(false);
    expect(isPaidEnrolledStatus("annule")).toBe(false);
    expect(isPaidEnrolledStatus(null)).toBe(false);
    expect(isPaidEnrolledStatus(undefined)).toBe(false);
  });
});
