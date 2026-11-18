import { describe, expect, it } from "vitest";

import { horsProcessPaidAtLocal } from "@/lib/paiements-hors-process";

describe("horsProcessPaidAtLocal", () => {
  it("garde une date locale exploitable par Postgres", () => {
    expect(horsProcessPaidAtLocal("2026-11-16T12:32")).toBe("2026-11-16 12:32:00");
    expect(horsProcessPaidAtLocal("2026-11-16T25:32")).toBeNull();
    expect(horsProcessPaidAtLocal("16/11/2026")).toBeNull();
  });
});
