"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { AdminOutilsNav } from "@/features/admin/AdminOutilsNav";
import { PaiementStatusBadge } from "@/features/inscriptions/PaiementStatusBadge";
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

export function LesPaiementsAdmin({ paiements }: LesPaiementsAdminProps) {
  const [filter, setFilter] = useState<"tous" | PaiementStatus>("tous");

  const visible = useMemo(() => {
    if (filter === "tous") return paiements;
    return paiements.filter((row) => row.status === filter);
  }, [filter, paiements]);

  const paid = paiements.filter((row) => row.status === "paye");
  const paidTotal = paid.reduce((sum, row) => sum + (row.amountEuros ?? 0), 0);

  return (
    <>
      <header className="relative overflow-hidden bg-noir pt-6 pb-5 sm:pt-8 sm:pb-6 md:pt-10 md:pb-8">
        <div className="container-page space-y-4">
          <h1 className="display-title text-cream">Les paiements</h1>
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
                    "inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors",
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
          ) : (
            <>
              <ul className="space-y-3 md:hidden">
                {visible.map((row) => (
                  <li key={row.id} className="card-stage p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-cream">{eleveLabel(row)}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-text">
                          {row.eleveEmail}
                        </p>
                      </div>
                      <PaiementStatusBadge status={row.status} />
                    </div>
                    <p className="mt-3 text-sm text-cream">
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
                    </p>
                    {row.sessionLabel ? (
                      <p className="mt-1 text-sm text-muted-text">{row.sessionLabel}</p>
                    ) : null}
                    <div className="mt-3 flex items-baseline justify-between gap-3">
                      <p className="font-heading text-lg text-cream">
                        {row.amountEuros != null
                          ? formatEurosLabel(row.amountEuros)
                          : "—"}
                      </p>
                      <p className="text-xs text-muted-text">{formatPaidAt(row.paidAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="card-stage hidden overflow-x-clip md:block">
                <table className="w-full min-w-0 text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-[11px] font-semibold uppercase tracking-wider text-muted-text">
                      <th className="px-4 py-3">Élève</th>
                      <th className="px-4 py-3">Formation</th>
                      <th className="px-4 py-3">Session</th>
                      <th className="px-4 py-3">Montant</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-border/70 last:border-0"
                      >
                        <td className="px-4 py-3 align-top">
                          <p className="font-medium text-cream">{eleveLabel(row)}</p>
                          <p className="text-xs text-muted-text">{row.eleveEmail}</p>
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
                          {row.amountEuros != null
                            ? formatEurosLabel(row.amountEuros)
                            : "—"}
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
          )}
        </div>
      </section>
    </>
  );
}
