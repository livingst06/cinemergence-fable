import { describe, expect, it } from "vitest";

import {
  sessionHasAssignedUser,
  sessionMatchesStaff,
} from "@/lib/staff-session-match";

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

describe("sessionHasAssignedUser", () => {
  it("autorise formateur ou intervenant assigné", () => {
    expect(sessionHasAssignedUser(group, 10, [])).toBe(true);
    expect(sessionHasAssignedUser(group, 20, [])).toBe(true);
    expect(sessionHasAssignedUser(group, 99, ["pro@example.com"])).toBe(true);
  });

  it("refuse un élève hors staff", () => {
    expect(sessionHasAssignedUser(group, 99, ["eleve@example.com"])).toBe(
      false,
    );
  });
});
