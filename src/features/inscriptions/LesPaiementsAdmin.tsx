"use client";

import type { CSSProperties } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AdminDeleteButton } from "@/features/admin/AdminMutationButtons";
import { AdminOutilsNav } from "@/features/admin/AdminOutilsNav";
import { AdminDeleteConfirmDialog } from "@/features/formations/AdminDeleteConfirmDialog";
import { deleteHorsProcessPaiementAction } from "@/features/inscriptions/hors-process-actions";
import {
  HorsProcessPaiementDialog,
  type HorsProcessSessionChoice,
} from "@/features/inscriptions/HorsProcessPaiementDialog";
import { PaiementStatusBadge } from "@/features/inscriptions/PaiementStatusBadge";
import {
  FORMATION_TILE_CLASS,
  formationColorName,
  formationTileStyle,
} from "@/lib/formation-pastel";
import { formationPath } from "@/lib/formation-types";
import { formatEurosLabel } from "@/lib/inscription-status";
import {
  nextPaiementSort,
  sortPaiementRows,
  type PaiementSort,
  type PaiementSortKey,
} from "@/lib/paiement-sort";
import {
  PAIEMENT_CANAL_LABELS,
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
  { id: "liste", label: "Tous les paiements" },
  { id: "eleve", label: "Par élève" },
  { id: "session", label: "Par session" },
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
  sessions: HorsProcessSessionChoice[];
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

function paidTotalOf(rows: AdminPaiementRow[]): number {
  return rows
    .filter((row) => row.status === "paye")
    .reduce((sum, row) => sum + (row.amountEuros ?? 0), 0);
}

function groupByEleve(rows: AdminPaiementRow[]): PaiementGroup[] {
  const map = new Map<string, PaiementGroup>();
  for (const row of rows) {
    const email = row.eleveEmail.trim().toLowerCase();
    const key = email.includes("@") ? `email:${email}` : `row:${row.id}`;
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

const ELEVE_ROW_BLUES = ["#17306a", "#24448f"] as const;

const LIST_COLUMNS: Array<{ key: PaiementSortKey; label: string }> = [
  { key: "eleve", label: "Élève" },
  { key: "formation", label: "Formation" },
  { key: "session", label: "Session" },
  { key: "montant", label: "Montant" },
  { key: "date", label: "Date" },
  { key: "statut", label: "Statut" },
];

function PaiementSortHeader({
  column,
  label,
  sort,
  onSort,
}: {
  column: PaiementSortKey;
  label: string;
  sort: PaiementSort;
  onSort: (key: PaiementSortKey) => void;
}) {
  const active = sort?.key === column;
  const ariaSort = !active ? "none" : sort.dir === "asc" ? "ascending" : "descending";

  return (
    <th aria-sort={ariaSort} className="px-4 py-3">
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          "inline-flex min-h-9 items-center gap-1.5 text-left font-semibold transition-colors hover:text-cream",
          active ? "text-cream" : "text-muted-text",
        )}
      >
        {label}
        {active ? (
          sort.dir === "asc" ? (
            <ArrowUp className="size-3.5 shrink-0" aria-hidden />
          ) : (
            <ArrowDown className="size-3.5 shrink-0" aria-hidden />
          )
        ) : (
          <ChevronsUpDown className="size-3.5 shrink-0 opacity-40" aria-hidden />
        )}
        <span className="sr-only">
          {active
            ? sort.dir === "asc"
              ? ", tri croissant, activer pour trier en décroissant"
              : ", tri décroissant, activer pour retirer le tri"
            : ", activer pour trier"}
        </span>
      </button>
    </th>
  );
}

function PaiementCard({
  row,
  className,
  style,
  onDelete,
}: {
  row: AdminPaiementRow;
  className?: string;
  style?: CSSProperties;
  onDelete?: (row: AdminPaiementRow) => void;
}) {
  return (
    <article className={cn("p-4", className)} style={style}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-cream">{eleveLabel(row)}</p>
          <p className="mt-0.5 truncate text-sm text-muted-text">{row.eleveEmail}</p>
        </div>
        <div className="flex items-start gap-2">
          <div className="flex flex-col items-end gap-1">
            <PaiementStatusBadge status={row.status} />
            <p className="text-xs text-muted-text">{PAIEMENT_CANAL_LABELS[row.canal]}</p>
          </div>
          {onDelete && row.canal === "hors_process" ? (
            <AdminDeleteButton
              label={`Supprimer le paiement de ${eleveLabel(row)}`}
              onClick={() => onDelete(row)}
            />
          ) : null}
        </div>
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
  sort = null,
  onSort,
  onDelete,
}: {
  rows: AdminPaiementRow[];
  nested?: boolean;
  sort?: PaiementSort;
  onSort?: (key: PaiementSortKey) => void;
  onDelete?: (row: AdminPaiementRow) => void;
}) {
  const sortable = Boolean(onSort);

  return (
    <>
      <ul className={cn("space-y-3 md:hidden", nested && "px-4 pt-3 pb-4")}>
        {rows.map((row, index) => (
          <li key={row.id}>
            <PaiementCard
              row={row}
              className="card-stage"
              style={{ backgroundColor: ELEVE_ROW_BLUES[index % 2] }}
              onDelete={onDelete}
            />
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
              {sortable && onSort
                ? LIST_COLUMNS.map((column) => (
                    <PaiementSortHeader
                      key={column.key}
                      column={column.key}
                      label={column.label}
                      sort={sort}
                      onSort={onSort}
                    />
                  ))
                : LIST_COLUMNS.map((column) => (
                    <th key={column.key} className="px-4 py-3">
                      {column.label}
                    </th>
                  ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.id}
                className="border-b border-white/10 last:border-0"
                style={{ backgroundColor: ELEVE_ROW_BLUES[index % 2] }}
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
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <PaiementStatusBadge status={row.status} />
                      <p className="mt-1 text-xs text-muted-text">
                        {PAIEMENT_CANAL_LABELS[row.canal]}
                      </p>
                    </div>
                    {onDelete && row.canal === "hors_process" ? (
                      <AdminDeleteButton
                        label={`Supprimer le paiement de ${eleveLabel(row)}`}
                        onClick={() => onDelete(row)}
                      />
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function PaiementGroupedList({
  groups,
  onDelete,
}: {
  groups: PaiementGroup[];
  onDelete?: (row: AdminPaiementRow) => void;
}) {
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
              <PaiementFlatList rows={group.rows} nested onDelete={onDelete} />
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

export function LesPaiementsAdmin({ paiements, sessions }: LesPaiementsAdminProps) {
  const router = useRouter();
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleting, setDeleting] = useState<AdminPaiementRow | null>(null);
  const [deletePending, startDelete] = useTransition();
  const [filter, setFilter] = useState<"tous" | PaiementStatus>("tous");
  const [view, setView] = useState<ViewMode>("liste");
  const [sort, setSort] = useState<PaiementSort>(null);

  const visible = useMemo(() => {
    if (filter === "tous") return paiements;
    return paiements.filter((row) => row.status === filter);
  }, [filter, paiements]);

  const sortedVisible = useMemo(
    () => sortPaiementRows(visible, view === "liste" ? sort : null),
    [sort, view, visible],
  );

  const eleveGroups = useMemo(() => groupByEleve(visible), [visible]);
  const sessionGroups = useMemo(() => groupBySession(visible), [visible]);

  const paid = paiements.filter((row) => row.status === "paye");
  const stripePaid = paid.filter((row) => row.canal === "stripe");
  const horsPaid = paid.filter((row) => row.canal === "hors_process");
  const sumEuros = (rows: AdminPaiementRow[]) =>
    rows.reduce((sum, row) => sum + (row.amountEuros ?? 0), 0);
  const paidTotal = sumEuros(paid);
  const onDelete = (row: AdminPaiementRow) => setDeleting(row);

  const confirmDelete = () => {
    if (!deleting) return;
    const id = Number(deleting.id.replace(/^hors:/, ""));
    startDelete(async () => {
      const result = await deleteHorsProcessPaiementAction(id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      setDeleting(null);
      router.refresh();
    });
  };

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
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="card-stage p-4 sm:p-5">
              <p className="eyebrow">Stripe</p>
              <p className="mt-2 font-heading text-2xl text-cream md:text-3xl">
                {stripePaid.length}
              </p>
              <p className="mt-1 text-sm text-muted-text">
                {formatEurosLabel(sumEuros(stripePaid))} encaissés
              </p>
            </div>
            <div className="card-stage flex h-full flex-col p-4 sm:p-5">
              <p className="eyebrow">Hors process</p>
              <p className="mt-2 font-heading text-2xl text-cream md:text-3xl">
                {horsPaid.length}
              </p>
              <div className="mt-1 flex items-center justify-between gap-3">
                <p className="min-w-0 text-sm text-muted-text">
                  {formatEurosLabel(sumEuros(horsPaid))} · virement ou espèces
                </p>
                <button
                  type="button"
                  onClick={() => setEditorOpen(true)}
                  className="inline-flex h-7 shrink-0 items-center rounded-full border border-emerald-500 bg-emerald-600 px-2.5 text-xs font-medium text-white shadow-sm transition-colors duration-200 hover:bg-emerald-500 dark:border-emerald-400 dark:bg-emerald-500 dark:text-emerald-950 dark:hover:bg-emerald-400"
                >
                  Ajouter un paiement hors process
                </button>
              </div>
            </div>
            <div className="card-stage p-4 sm:p-5">
              <p className="eyebrow">Total encaissé</p>
              <p className="mt-2 font-heading text-2xl text-cream md:text-3xl">
                {formatEurosLabel(paidTotal)}
              </p>
              <p className="mt-1 text-sm text-muted-text">Stripe et hors process</p>
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
                Les encaissements Stripe et les paiements hors process apparaîtront ici.
              </p>
            </div>
          ) : view === "eleve" ? (
            <PaiementGroupedList groups={eleveGroups} onDelete={onDelete} />
          ) : view === "session" ? (
            <PaiementGroupedList groups={sessionGroups} onDelete={onDelete} />
          ) : (
            <PaiementFlatList
              rows={sortedVisible}
              sort={sort}
              onSort={(key) => setSort((current) => nextPaiementSort(current, key))}
              onDelete={onDelete}
            />
          )}
        </div>
      </section>
      <HorsProcessPaiementDialog
        open={editorOpen}
        sessions={sessions}
        onClose={() => setEditorOpen(false)}
        onSaved={() => router.refresh()}
      />
      <AdminDeleteConfirmDialog
        open={deleting != null}
        title={deleting ? `${eleveLabel(deleting)} · ${formatEurosLabel(deleting.amountEuros ?? 0)}` : ""}
        entityLabel="ligne hors process"
        pending={deletePending}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
