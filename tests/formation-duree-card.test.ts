import { describe, expect, it } from "vitest";

import { formationDureeCardLabel } from "@/lib/formation-types";

describe("formationDureeCardLabel", () => {
  it("formats heures and jours", () => {
    expect(
      formationDureeCardLabel({ duree: "", dureeHeures: 63, dureeJours: 9 }),
    ).toBe("63 heures sur 9 jours");
  });

  it("uses singular without s for 1 heure / 1 jour", () => {
    expect(
      formationDureeCardLabel({ duree: "", dureeHeures: 1, dureeJours: 1 }),
    ).toBe("1 heure sur 1 jour");
  });

  it("parses from duree label when numbers missing", () => {
    expect(
      formationDureeCardLabel({
        duree: "35 heures — 5 journées de 7 heures",
      }),
    ).toBe("35 heures sur 5 jours");
  });
});
