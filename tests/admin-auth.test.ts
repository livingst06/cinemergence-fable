import { afterEach, describe, expect, it } from "vitest";

import { emailMatchesAdminList } from "@/lib/admin-auth";
import {
  isAssignableRole,
  roleForNewUser,
  syncedRoleForExistingUser,
} from "@/lib/user-roles";

describe("emailMatchesAdminList", () => {
  const admins = ["tom.mccallaghan@gmail.com"];

  it("reconnaît l’email admin sans tenir compte de la casse", () => {
    expect(emailMatchesAdminList("Tom.McCallaghan@gmail.com", admins)).toBe(true);
  });

  it("refuse un email hors liste", () => {
    expect(emailMatchesAdminList("eleve@example.com", admins)).toBe(false);
  });

  it("refuse si la liste est vide", () => {
    expect(emailMatchesAdminList("tom.mccallaghan@gmail.com", [])).toBe(false);
  });
});

describe("rôles admin vs staff", () => {
  const previous = process.env.ADMIN_LIST;

  afterEach(() => {
    if (previous === undefined) delete process.env.ADMIN_LIST;
    else process.env.ADMIN_LIST = previous;
  });

  it("crée un élève hors ADMIN_LIST et un admin s’il y est", () => {
    process.env.ADMIN_LIST = "admin@example.com";
    expect(roleForNewUser("quelquun@example.com")).toBe("eleve");
    expect(roleForNewUser("admin@example.com")).toBe("admin");
  });

  it("ne rétrograde pas un formateur ou un intervenant", () => {
    process.env.ADMIN_LIST = "admin@example.com";
    expect(syncedRoleForExistingUser("pro@example.com", "formateur")).toBe(
      "formateur",
    );
    expect(syncedRoleForExistingUser("pro@example.com", "intervenant")).toBe(
      "intervenant",
    );
    expect(syncedRoleForExistingUser("pro@example.com", "eleve")).toBe("eleve");
  });

  it("promouvoit ou retire admin selon la whitelist", () => {
    process.env.ADMIN_LIST = "admin@example.com";
    expect(syncedRoleForExistingUser("admin@example.com", "eleve")).toBe("admin");
    expect(syncedRoleForExistingUser("ex@example.com", "admin")).toBe("eleve");
  });

  it("n’accepte que élève / formateur / intervenant comme rôles assignables", () => {
    expect(isAssignableRole("eleve")).toBe(true);
    expect(isAssignableRole("formateur")).toBe(true);
    expect(isAssignableRole("intervenant")).toBe(true);
    expect(isAssignableRole("admin")).toBe(false);
  });
});
