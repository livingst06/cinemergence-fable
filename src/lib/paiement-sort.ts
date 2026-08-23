import type { AdminPaiementRow, PaiementStatus } from "@/lib/paiement-status";

export type PaiementSortKey =
  | "eleve"
  | "formation"
  | "session"
  | "montant"
  | "date"
  | "statut";

export type PaiementSortDir = "asc" | "desc";

export type PaiementSort = {
  key: PaiementSortKey;
  dir: PaiementSortDir;
} | null;

const STATUS_ORDER: Record<PaiementStatus, number> = {
  paye: 0,
  en_cours: 1,
  refuse: 2,
  rembourse: 3,
  annule: 4,
};

function eleveSortLabel(row: AdminPaiementRow): string {
  const full = [row.elevePrenom, row.eleveNom].filter(Boolean).join(" ").trim();
  return full || row.eleveEmail || "";
}

function compareText(a: string, b: string): number {
  return a.localeCompare(b, "fr", { sensitivity: "base" });
}

function withNullsLast(
  aMissing: boolean,
  bMissing: boolean,
  compared: number,
  direction: number,
): number {
  if (aMissing && bMissing) return 0;
  if (aMissing) return 1;
  if (bMissing) return -1;
  return compared * direction;
}

function compareTextRows(
  key: Exclude<PaiementSortKey, "montant" | "date">,
  a: AdminPaiementRow,
  b: AdminPaiementRow,
): number {
  switch (key) {
    case "eleve":
      return (
        compareText(eleveSortLabel(a), eleveSortLabel(b)) ||
        compareText(a.eleveEmail, b.eleveEmail)
      );
    case "formation":
      return compareText(a.formationTitre, b.formationTitre);
    case "session":
      return compareText(a.sessionLabel ?? "", b.sessionLabel ?? "");
    case "statut":
      return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
  }
}

export function nextPaiementSort(
  current: PaiementSort,
  key: PaiementSortKey,
): PaiementSort {
  if (current?.key !== key) return { key, dir: "asc" };
  if (current.dir === "asc") return { key, dir: "desc" };
  return null;
}

export function sortPaiementRows(
  rows: AdminPaiementRow[],
  sort: PaiementSort,
): AdminPaiementRow[] {
  if (!sort) return rows;
  const direction = sort.dir === "asc" ? 1 : -1;
  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      let cmp: number;
      if (sort.key === "montant") {
        cmp = withNullsLast(
          a.row.amountEuros == null,
          b.row.amountEuros == null,
          (a.row.amountEuros ?? 0) - (b.row.amountEuros ?? 0),
          direction,
        );
      } else if (sort.key === "date") {
        const aTime = Date.parse(a.row.paidAt);
        const bTime = Date.parse(b.row.paidAt);
        cmp = withNullsLast(
          Number.isNaN(aTime),
          Number.isNaN(bTime),
          aTime - bTime,
          direction,
        );
      } else {
        cmp = compareTextRows(sort.key, a.row, b.row) * direction;
      }
      if (cmp !== 0) return cmp;
      return a.index - b.index;
    })
    .map((item) => item.row);
}
