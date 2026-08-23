import { describe, expect, it } from "vitest";

import type { AdminPaiementRow } from "@/lib/paiement-status";
import {
  nextPaiementSort,
  sortPaiementRows,
} from "@/lib/paiement-sort";

function row(
  partial: Partial<AdminPaiementRow> & Pick<AdminPaiementRow, "id">,
): AdminPaiementRow {
  return {
    inscriptionId: null,
    elevePrenom: "",
    eleveNom: "",
    eleveEmail: "",
    formationTitre: "",
    formationSlug: null,
    sessionLabel: null,
    amountEuros: null,
    paidAt: "2026-08-01T10:00:00.000Z",
    status: "annule",
    ...partial,
  };
}

describe("nextPaiementSort", () => {
  it("alterne asc, desc, puis reset", () => {
    const first = nextPaiementSort(null, "eleve");
    expect(first).toEqual({ key: "eleve", dir: "asc" });
    const second = nextPaiementSort(first, "eleve");
    expect(second).toEqual({ key: "eleve", dir: "desc" });
    expect(nextPaiementSort(second, "eleve")).toBeNull();
  });
});

describe("sortPaiementRows", () => {
  const rows = [
    row({
      id: "1",
      elevePrenom: "Salim",
      eleveNom: "Kéchiouche",
      formationTitre: "Bande démo",
      amountEuros: 560,
      paidAt: "2026-08-23T12:00:00.000Z",
      status: "annule",
    }),
    row({
      id: "2",
      elevePrenom: "Tom",
      eleveNom: "Mccallaghan",
      formationTitre: "Prise de parole",
      amountEuros: 1490,
      paidAt: "2026-08-10T12:00:00.000Z",
      status: "paye",
    }),
    row({
      id: "3",
      elevePrenom: "Ada",
      eleveNom: "Lovelace",
      formationTitre: "Réaliser son film",
      amountEuros: null,
      paidAt: "2026-08-20T12:00:00.000Z",
      status: "en_cours",
    }),
  ];

  it("trie les élèves A→Z", () => {
    const sorted = sortPaiementRows(rows, { key: "eleve", dir: "asc" });
    expect(sorted.map((item) => item.id)).toEqual(["3", "1", "2"]);
  });

  it("trie les montants et laisse les vides à la fin en croissant", () => {
    const sorted = sortPaiementRows(rows, { key: "montant", dir: "asc" });
    expect(sorted.map((item) => item.id)).toEqual(["1", "2", "3"]);
  });

  it("laisse les montants vides à la fin aussi en décroissant", () => {
    const sorted = sortPaiementRows(rows, { key: "montant", dir: "desc" });
    expect(sorted.map((item) => item.id)).toEqual(["2", "1", "3"]);
  });

  it("trie les dates du plus ancien au plus récent", () => {
    const sorted = sortPaiementRows(rows, { key: "date", dir: "asc" });
    expect(sorted.map((item) => item.id)).toEqual(["2", "3", "1"]);
  });

  it("trie les statuts payé → en cours → annulé", () => {
    const sorted = sortPaiementRows(rows, { key: "statut", dir: "asc" });
    expect(sorted.map((item) => item.status)).toEqual([
      "paye",
      "en_cours",
      "annule",
    ]);
  });
});
