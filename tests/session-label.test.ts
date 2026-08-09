import { describe, expect, it } from "vitest";

import {
  formatFormationSessionLabel,
  isGeneratedSessionLabel,
} from "@/lib/inscription-status";

describe("formatFormationSessionLabel", () => {
  it("returns a single Session du … line", () => {
    expect(
      formatFormationSessionLabel("2026-09-18", "2026-09-21", { month: "long" }),
    ).toBe("Session du 18 au 21 septembre 2026");
  });
});

describe("isGeneratedSessionLabel", () => {
  it("detects ISO auto labels", () => {
    expect(isGeneratedSessionLabel("Session 2026-09-18 → 2026-09-21")).toBe(true);
    expect(isGeneratedSessionLabel("Session automne 2026")).toBe(false);
  });
});
