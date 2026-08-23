import { describe, expect, it } from "vitest";

import { sortIntervenantsParrainsFirst } from "@/lib/data";
import type { IntervenantData } from "@/lib/defaults";

function person(
  nom: string,
  parrain: boolean,
): IntervenantData {
  return {
    slug: nom.toLowerCase().replace(/\s+/g, "-"),
    nom,
    role: "Acteur",
    parrain,
    categorie: "professionnel",
    bio: "",
    filmographie: [],
  };
}

describe("sortIntervenantsParrainsFirst", () => {
  it("place les parrains avant les autres, puis trie par nom", () => {
    const sorted = sortIntervenantsParrainsFirst([
      person("Salim Kéchiouche", false),
      person("Zoé Parrain", true),
      person("Bibi Naceri", true),
      person("Édouard Montoute", false),
    ]);

    expect(sorted.map((i) => i.nom)).toEqual([
      "Bibi Naceri",
      "Zoé Parrain",
      "Édouard Montoute",
      "Salim Kéchiouche",
    ]);
  });
});
