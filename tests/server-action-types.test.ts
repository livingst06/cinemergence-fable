import { describe, expect, it } from "vitest";

import { findClientServerActionTypeImports } from "../scripts/check-architecture.mjs";

describe("imports de types depuis les actions serveur", () => {
  it("aucun composant client n'importe un type depuis un fichier use server", () => {
    expect(findClientServerActionTypeImports()).toEqual([]);
  });
});
