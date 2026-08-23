import { afterEach, describe, expect, it } from "vitest";

import { emailMatchesAdminList } from "@/lib/admin-auth";
import { roleForEmail, roleForEmails } from "@/lib/user-roles";

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

describe("roleForEmail", () => {
  const envKeys = ["ADMIN_LIST", "FORMATEUR_LIST", "INTERVENANT_LIST"] as const;
  const previous = Object.fromEntries(
    envKeys.map((key) => [key, process.env[key]]),
  );

  afterEach(() => {
    for (const key of envKeys) {
      const value = previous[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  function setLists(lists: Partial<Record<(typeof envKeys)[number], string>>) {
    process.env.ADMIN_LIST = lists.ADMIN_LIST ?? "";
    process.env.FORMATEUR_LIST = lists.FORMATEUR_LIST ?? "";
    process.env.INTERVENANT_LIST = lists.INTERVENANT_LIST ?? "";
  }

  it("donne élève par défaut", () => {
    setLists({});
    expect(roleForEmail("quelquun@example.com")).toBe("eleve");
  });

  it("assigne admin, formateur ou intervenant selon la whitelist", () => {
    setLists({
      ADMIN_LIST: "admin@example.com",
      FORMATEUR_LIST: "formateur@example.com",
      INTERVENANT_LIST: "intervenant@example.com",
    });
    expect(roleForEmail("admin@example.com")).toBe("admin");
    expect(roleForEmail("formateur@example.com")).toBe("formateur");
    expect(roleForEmail("intervenant@example.com")).toBe("intervenant");
  });

  it("priorise admin puis formateur puis intervenant", () => {
    setLists({
      ADMIN_LIST: "mix@example.com",
      FORMATEUR_LIST: "mix@example.com",
      INTERVENANT_LIST: "mix@example.com",
    });
    expect(roleForEmail("mix@example.com")).toBe("admin");

    setLists({
      FORMATEUR_LIST: "mix@example.com",
      INTERVENANT_LIST: "mix@example.com",
    });
    expect(roleForEmail("mix@example.com")).toBe("formateur");
  });

  it("regarde toutes les adresses Clerk", () => {
    setLists({ INTERVENANT_LIST: "pro@example.com" });
    expect(roleForEmails(["perso@example.com", "pro@example.com"])).toBe(
      "intervenant",
    );
  });
});
