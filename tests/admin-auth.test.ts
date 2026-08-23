import { describe, expect, it } from "vitest";

import { emailMatchesAdminList } from "@/lib/admin-auth";

describe("emailMatchesAdminList", () => {
  const admins = ["tom.mccallaghan@gmail.com"];

  it("reconnaît l’email admin sans tenir compte de la casse", () => {
    expect(emailMatchesAdminList("Tom.McCallaghan@gmail.com", admins)).toBe(true);
  });

  it("refuse un email hors liste", () => {
    expect(emailMatchesAdminList("stagiaire@example.com", admins)).toBe(false);
  });

  it("refuse si la liste est vide", () => {
    expect(emailMatchesAdminList("tom.mccallaghan@gmail.com", [])).toBe(false);
  });
});
