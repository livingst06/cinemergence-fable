import { describe, expect, it } from "vitest";

import { sessionMatchesStaff } from "@/lib/staff-session-match";

const group = {
  formateurs: [
    { id: 10, email: "formateur@example.com" },
    { id: 11, email: null },
  ],
  intervenants: [{ id: 20, email: "pro@example.com" }],
};

describe("sessionMatchesStaff", () => {
  it("reconnaît un formateur par email", () => {
    expect(
      sessionMatchesStaff(group, new Set(), ["Formateur@example.com"], "formateur"),
    ).toBe(true);
    expect(
      sessionMatchesStaff(group, new Set(), ["Formateur@example.com"], "intervenant"),
    ).toBe(false);
  });

  it("reconnaît un intervenant par id CMS", () => {
    expect(
      sessionMatchesStaff(group, new Set(["20"]), ["autre@example.com"], "intervenant"),
    ).toBe(true);
    expect(
      sessionMatchesStaff(group, new Set(["20"]), ["autre@example.com"], "formateur"),
    ).toBe(false);
  });

  it("ignore une session sans correspondance", () => {
    expect(
      sessionMatchesStaff(group, new Set(), ["eleve@example.com"], "formateur"),
    ).toBe(false);
  });
});
