import { describe, expect, it } from "vitest";

import {
  isSalonStaffRole,
  SALON_STAFF_ROLE_LABEL,
  salonAuthorRole,
  splitPersonName,
} from "@/lib/salon-constants";

describe("splitPersonName", () => {
  it("sépare prénom et nom", () => {
    expect(splitPersonName("Sylvain VERDAT")).toEqual({
      firstName: "Sylvain",
      lastName: "VERDAT",
    });
  });

  it("garde un nom composé", () => {
    expect(splitPersonName("Marie Claire DUPONT")).toEqual({
      firstName: "Marie",
      lastName: "Claire DUPONT",
    });
  });

  it("accepte un prénom seul", () => {
    expect(splitPersonName("Sylvain")).toEqual({
      firstName: "Sylvain",
      lastName: "",
    });
  });
});

describe("salon author role", () => {
  it("ne badge pas les élèves", () => {
    expect(isSalonStaffRole("eleve")).toBe(false);
    expect(salonAuthorRole("inconnu")).toBe("eleve");
  });

  it("labellise le staff", () => {
    expect(isSalonStaffRole("formateur")).toBe(true);
    expect(SALON_STAFF_ROLE_LABEL.admin).toBe("Admin");
    expect(SALON_STAFF_ROLE_LABEL.formateur).toBe("Formateur");
    expect(SALON_STAFF_ROLE_LABEL.intervenant).toBe("Intervenant");
  });
});
