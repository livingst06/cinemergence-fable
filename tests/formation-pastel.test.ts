import { describe, expect, it } from "vitest";

import {
  circularHueDistance,
  fnv1a32,
  formationColorName,
  hueForFormationName,
  normalizeFormationColorKey,
  pastelForFormationName,
} from "@/lib/formation-pastel";
import { formationsCatalog } from "@/lib/formations-catalog";

describe("normalizeFormationColorKey", () => {
  it("ignore casse, accents et espaces", () => {
    expect(normalizeFormationColorKey("  Réaliser  son Film ")).toBe(
      "realiser son film",
    );
  });
});

describe("pastelForFormationName", () => {
  it("est déterministe pour un même nom", () => {
    const a = pastelForFormationName("Jouer face caméra");
    const b = pastelForFormationName("jouer face camera");
    expect(a).toEqual(b);
  });

  it("écarte les teintes du catalogue d'au moins 360° / n", () => {
    const uniqueTitres = [
      ...new Set(formationsCatalog.map((f) => f.titre)),
    ];
    const hues = uniqueTitres.map((titre) => hueForFormationName(titre));
    const minGap = 360 / hues.length - 0.05;
    for (let i = 0; i < hues.length; i += 1) {
      for (let j = i + 1; j < hues.length; j += 1) {
        expect(circularHueDistance(hues[i]!, hues[j]!)).toBeGreaterThanOrEqual(
          minGap,
        );
      }
    }
  });

  it("sépare maquillage et film court (plus le même olive)", () => {
    const uniqueCount = new Set(formationsCatalog.map((f) => f.titre)).size;
    const gap = circularHueDistance(
      hueForFormationName("Maquillage pour le cinéma et l'audiovisuel"),
      hueForFormationName("Réaliser son film court de A à Z"),
    );
    expect(gap).toBeGreaterThanOrEqual(360 / uniqueCount - 0.05);
    expect(
      pastelForFormationName("Maquillage pour le cinéma et l'audiovisuel")
        .emptyDark,
    ).not.toBe(
      pastelForFormationName("Réaliser son film court de A à Z").emptyDark,
    );
  });

  it("place un titre hors catalogue à l'écart des teintes du catalogue", () => {
    const extra = hueForFormationName("Stage Bande Démo Cinéma");
    const uniqueCount = new Set(formationsCatalog.map((f) => f.titre)).size;
    const minGap = Math.min(12, 180 / uniqueCount);
    for (const formation of formationsCatalog) {
      expect(
        circularHueDistance(extra, hueForFormationName(formation.titre)),
      ).toBeGreaterThanOrEqual(minGap - 0.05);
    }
  });

  it("aligne slug Stripe et titre catalogue sur la même couleur", () => {
    expect(
      formationColorName(
        "formation-realiser-film-court",
        "formation-realiser-film-court",
      ),
    ).toBe("Réaliser son film court de A à Z");
    expect(
      pastelForFormationName("Réaliser son film court de A à Z"),
    ).toEqual(
      pastelForFormationName(
        formationColorName("formation-realiser-film-court"),
      ),
    );
  });

  it("FNV-1a avalanche : un caractère change le hash", () => {
    expect(fnv1a32("formation")).not.toBe(fnv1a32("Formation"));
  });
});
