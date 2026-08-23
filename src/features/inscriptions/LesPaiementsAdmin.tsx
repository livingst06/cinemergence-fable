"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AdminOutilsNav } from "@/features/admin/AdminOutilsNav";
import { PaiementStatusBadge } from "@/features/inscriptions/PaiementStatusBadge";
import {
  FORMATION_ROW_CLASS,
  FORMATION_TILE_CLASS,
  formationColorName,
  formationTileStyle,
} from "@/lib/formation-pastel";
import { formationPath } from "@/lib/formation-types";
import { formatEurosLabel } from "@/lib/inscription-status";
import {
  PAIEMENT_STATUS_LABELS,
  type AdminPaiementRow,
  type PaiementStatus,
} from "@/lib/paiement-status";
import { cn } from "@/lib/utils";

const FILTERS: Array<{ id: "tous" | PaiementStatus; label: string }> = [
  { id: "tous", label: "Tous" },
  { id: "paye", label: PAIEMENT_STATUS_LABELS.paye },
  { id: "en_cours", label: PAIEMENT_STATUS_LABELS.en_cours },
  { id: "annule", label: PAIEMENT_STATUS_LABELS.annule },
  { id: "refuse", label: PAIEMENT_STATUS_LABELS.refuse },
];

type ViewMode = "eleve" | "session" | "liste";

const VIEW_MODES: Array<{ id: ViewMode; label: string }> = [
  { id: "eleve", label: "Par élève" },
  { id: "session", label: "Par session" },
  { id: "liste", label: "Liste brute" },
];

type PaiementGroup = {
  key: string;
  title: string;
  subtitle: string | null;
  rows: AdminPaiementRow[];
  /** Nom de formation pour teinter la tuile (groupement par session uniquement). */
  tileName?: string;
};

type LesPaiementsAdminProps = {
  paiements: AdminPaiementRow[];
};

function formatPaidAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function eleveLabel(row: AdminPaiementRow): string {
  const full = [row.elevePrenom, row.eleveNom].filter(Boolean).join(" ").trim();
  return full || row.eleveEmail || "Élève";
}

function formationColorKey(row: AdminPaiementRow): string {
  return formationColorName(row.formationTitre, row.formationSlug);
}

function paidTotalOf(rows: AdminPaiementRow[]): number {
  return rows
    .filter((row) => row.status === "paye")
    .reduce((sum, row) => sum + (row.amountEuros ?? 0), 0);
}

function groupByEleve(rows: AdminPaiementRow[]): PaiementGroup[] {
  const map = new Map<string, PaiementGroup>();
  for (const row of rows) {
    const email = row.eleveEmail.trim().toLowerCase();
    const key = email && email !== "—" ? `email:${email}` : `name:${eleveLabel(row)}`;
    const existing = map.get(key);
    if (existing) {
      existing.rows.push(row);
      continue;
    }
    map.set(key, {
      key,
      title: eleveLabel(row),
      subtitle: row.eleveEmail !== "—" ? row.eleveEmail : null,
      rows: [row],
    });
  }
  return [...map.values()].sort((a, b) =>
    a.title.localeCompare(b.title, "fr", { sensitivity: "base" }),
  );
}

function groupBySession(rows: AdminPaiementRow[]): PaiementGroup[] {
  const map = new Map<string, PaiementGroup>();
  for (const row of rows) {
    const sessionKey = row.sessionLabel ?? "sans-session";
    const formationKey = row.formationSlug ?? row.formationTitre;
    const key = `${formationKey}::${sessionKey}`;
    const existing = map.get(key);
    if (existing) {
      existing.rows.push(row);
      continue;
    }
    map.set(key, {
      key,
      title: row.formationTitre,
      subtitle: row.sessionLabel,
      rows: [row],
      tileName: formationColorName(row.formationTitre, row.formationSlug),
    });
  }
  return [...map.values()].sort((a, b) => {
    const bySession = (a.subtitle ?? "").localeCompare(b.subtitle ?? "", "fr", {
      sensitivity: "base",
    });
    if (bySession !== 0) return bySession;
    return a.title.localeCompare(b.title, "fr", { sensitivity: "base" });
  });
}

function PaiementCard({
  row,
  className,
}: {
  row: AdminPaiementRow;
  className?: string;
}) {
  return (
    <article
      className={cn("p-4", className, FORMATION_TILE_CLASS)}
      style={formationTileStyle(formationColorKey(row))}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-cream">{eleveLabel(row)}</p>
          <p className="mt-0.5 truncate text-sm text-muted-text">{row.eleveEmail}</p>
        </div>
        <PaiementStatusBadge status={row.status} />
      </div>
      <p className="mt-3 text-sm text-cream">
        {row.formationSlug ? (
          <Link href={formationPath(row.formationSlug)} className="hover:text-or-light">
            {row.formationTitre}
          </Link>
        ) : (
          row.formationTitre
        )}
      </p>
      {row.sessionLabel ? (
        <p className="mt-1 text-sm text-muted-text">{row.sessionLabel}</p>
      ) : null}
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <p className="font-heading text-lg text-cream">
          {row.amountEuros != null ? formatEurosLabel(row.amountEuros) : "—"}
        </p>
        <p className="text-sm text-muted-text">{formatPaidAt(row.paidAt)}</p>
      </div>
    </article>
  );
}

function PaiementFlatList({
  rows,
  nested = false,
}: {
  rows: AdminPaiementRow[];
  nested?: boolean;
}) {
  return (
    <>
      <ul className={cn("space-y-3 md:hidden", nested && "px-4 pt-3 pb-4")}>
        {rows.map((row) => (
          <li key={row.id}>
            <PaiementCard row={row} className="card-stage" />
          </li>
        ))}
      </ul>

      <div
        className={cn(
          "hidden overflow-x-clip md:block",
          !nested && "card-stage",
        )}
      >
        <table className="w-full min-w-0 text-left text-sm">
          <thead>
            <tr className="border-b border-border text-sm font-semibold text-muted-text">
              <th className="px-4 py-3">Élève</th>
              <th className="px-4 py-3">Formation</th>
              <th className="px-4 py-3">Session</th>
              <th className="px-4 py-3">Montant</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-border/70 last:border-0",
                  FORMATION_ROW_CLASS,
                )}
                style={formationTileStyle(formationColorKey(row))}
              >
                <td className="px-4 py-3 align-top">
                  <p className="font-medium text-cream">{eleveLabel(row)}</p>
                  <p className="text-sm text-muted-text">{row.eleveEmail}</p>
                </td>
                <td className="px-4 py-3 align-top text-cream">
                  {row.formationSlug ? (
                    <Link
                      href={formationPath(row.formationSlug)}
                      className="hover:text-or-light"
                    >
                      {row.formationTitre}
                    </Link>
                  ) : (
                    row.formationTitre
                  )}
                </td>
                <td className="px-4 py-3 align-top text-muted-text">
                  {row.sessionLabel ?? "—"}
                </td>
                <td className="px-4 py-3 align-top font-heading text-cream">
                  {row.amountEuros != null ? formatEurosLabel(row.amountEuros) : "—"}
                </td>
                <td className="px-4 py-3 align-top text-muted-text">
                  {formatPaidAt(row.paidAt)}
                </td>
                <td className="px-4 py-3 align-top">
                  <PaiementStatusBadge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function PaiementGroupedList({ groups }: { groups: PaiementGroup[] }) {
  return (
    <Accordion multiple className="w-full min-w-0 space-y-3">
      {groups.map((group) => {
        const paid = paidTotalOf(group.rows);
        return (
          <AccordionItem
            key={group.key}
            value={group.key}
            className={cn(
              "card-stage overflow-hidden border-0 last:border-b-0",
              group.tileName && FORMATION_TILE_CLASS,
            )}
            style={group.tileName ? formationTileStyle(group.tileName) : undefined}
          >
            <AccordionTrigger
              className="px-4 py-3 hover:no-underline sm:px-5"
              headerClassName="w-full"
            >
              <span className="min-w-0 flex-1 pr-3">
                <span className="block font-heading text-base text-cream sm:text-lg">
                  {group.title}
                </span>
                {group.subtitle ? (
                  <span className="mt-0.5 block text-sm font-normal text-muted-text">
                    {group.subtitle}
                  </span>
                ) : null}
                <span className="mt-1 block text-sm font-normal text-muted-text">
                  {group.rows.length} paiement{group.rows.length > 1 ? "s" : ""}
                  {paid > 0 ? ` · ${formatEurosLabel(paid)} payés` : ""}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="border-t border-border/70 p-0 pb-0 [&_a]:no-underline [&_a]:hover:text-or-light [&_p:not(:last-child)]:mb-0">
              <PaiementFlatList rows={group.rows} nested />
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

export function LesPaiementsAdmin({ paiements }: LesPaiementsAdminProps) {
  const [filter, setFilter] = useState<"tous" | PaiementStatus>("tous");
  const [view, setView] = useState<ViewMode>("liste");

  const visible = useMemo(() => {
    if (filter === "tous") return paiements;
    return paiements.filter((row) => row.status === filter);
  }, [filter, paiements]);

  const eleveGroups = useMemo(() => groupByEleve(visible), [visible]);
  const sessionGroups = useMemo(() => groupBySession(visible), [visible]);

  const paid = paiements.filter((row) => row.status === "paye");
  const paidTotal = paid.reduce((sum, row) => sum + (row.amountEuros ?? 0), 0);

  return (
    <>
      <header className="relative overflow-hidden bg-noir pt-6 pb-5 sm:pt-8 sm:pb-6 md:pt-10 md:pb-8">
        <div className="container-page space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <h1 className="display-title min-w-0 text-cream">Les paiements</h1>
            <div
              className="flex min-w-0 flex-wrap gap-2 sm:max-w-[min(100%,28rem)] sm:justify-end"
              role="group"
              aria-label="Regrouper les paiements"
            >
              {VIEW_MODES.map((mode) => {
                const active = view === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setView(mode.id)}
                    className={cn(
                      "inline-flex min-h-11 items-center rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                      active
                        ? "border-or/40 bg-or/15 text-or-light"
                        : "border-border bg-card text-cream/80 hover:border-or/30 hover:text-or-light",
                    )}
                  >
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </div>
          <AdminOutilsNav current="paiements" />
        </div>
      </header>

      <section className="py-5 sm:py-6 md:py-8">
        <div className="container-page min-w-0 max-w-6xl space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="card-stage p-4 sm:p-5">
              <p className="eyebrow">Payés</p>
              <p className="mt-2 font-heading text-2xl text-cream md:text-3xl">
                {paid.length}
              </p>
              <p className="mt-1 text-sm text-muted-text">encaissements confirmés</p>
            </div>
            <div className="card-stage p-4 sm:p-5">
              <p className="eyebrow">Total encaissé</p>
              <p className="mt-2 font-heading text-2xl text-cream md:text-3xl">
                {formatEurosLabel(paidTotal)}
              </p>
              <p className="mt-1 text-sm text-muted-text">somme des paiements payés</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer les paiements">
            {FILTERS.map((item) => {
              const active = filter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(item.id)}
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "border-or/40 bg-or/15 text-or-light"
                      : "border-border bg-noir-tertiary/40 text-cream/75 hover:border-or/30 hover:text-or-light",
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {visible.length === 0 ? (
            <div className="card-stage p-8 text-center">
              <p className="text-cream">Aucun paiement pour l’instant</p>
              <p className="mt-2 text-sm text-muted-text">
                Les encaissements Stripe et les holds apparaîtront ici.
              </p>
            </div>
          ) : view === "eleve" ? (
            <PaiementGroupedList groups={eleveGroups} />
          ) : view === "session" ? (
            <PaiementGroupedList groups={sessionGroups} />
          ) : (
            <PaiementFlatList rows={visible} />
          )}
        </div>
      </section>
    </>
  );
}
