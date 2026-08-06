"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InscriptionStatusBadge } from "@/features/inscriptions/InscriptionStatusBadge";
import { setInscriptionStatus } from "@/features/inscriptions/actions";
import {
  normalizeInscriptionStatus,
  type InscriptionStatus,
} from "@/lib/inscription-status";
import { formationPath } from "@/lib/defaults";
import { cn } from "@/lib/utils";

export type AdminDemandeRow = {
  id: number | string;
  status: string;
  commentaireAdmin?: string | null;
  message?: string | null;
  updatedAt?: string;
  userEmail: string;
  userName: string;
  formationTitre: string;
  formationSlug: string;
};

type FilterKey = "a_valider" | "pieces" | "refusees" | "validees" | "toutes";

const filters: { key: FilterKey; label: string }[] = [
  { key: "a_valider", label: "À valider" },
  { key: "pieces", label: "Pièces complémentaires" },
  { key: "refusees", label: "Refusées" },
  { key: "validees", label: "Validées" },
  { key: "toutes", label: "Toutes" },
];

function matchesFilter(status: InscriptionStatus, filter: FilterKey): boolean {
  switch (filter) {
    case "a_valider":
      return status === "en_instruction";
    case "pieces":
      return status === "pieces_complementaires";
    case "refusees":
      return status === "refusee";
    case "validees":
      return status === "validee";
    default:
      return true;
  }
}

export function AdminDemandesPanel({ rows }: { rows: AdminDemandeRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterKey>("a_valider");
  const [comments, setComments] = useState<Record<string, string>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(
    () =>
      rows.filter((row) =>
        matchesFilter(normalizeInscriptionStatus(row.status), filter),
      ),
    [rows, filter],
  );

  const runStatus = (
    id: number | string,
    status: "validee" | "refusee" | "pieces_complementaires" | "en_instruction",
  ) => {
    const key = String(id);
    const commentaireAdmin = comments[key]?.trim() || null;
    setPendingId(key);
    startTransition(async () => {
      const result = await setInscriptionStatus({ id, status, commentaireAdmin });
      setPendingId(null);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              filter === f.key
                ? "border-or/40 bg-or/15 text-or-light"
                : "border-border text-cream/70 hover:border-or/25 hover:text-cream",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-text">Aucune demande dans ce filtre.</p>
      ) : (
        <ul className="space-y-4">
          {filtered.map((row) => {
            const key = String(row.id);
            const status = normalizeInscriptionStatus(row.status);
            const busy = pending && pendingId === key;
            return (
              <li
                key={key}
                className="rounded-2xl border border-border bg-noir-tertiary/40 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      href={formationPath(row.formationSlug)}
                      className="font-heading text-xl text-cream hover:text-or-light"
                    >
                      {row.formationTitre}
                    </Link>
                    <p className="mt-1 text-sm text-muted-text">
                      {row.userName || "Stagiaire"} · {row.userEmail}
                    </p>
                  </div>
                  <InscriptionStatusBadge status={row.status} />
                </div>

                {row.message ? (
                  <p className="mt-3 text-sm text-cream/80 text-pretty">« {row.message} »</p>
                ) : null}

                {row.commentaireAdmin &&
                (status === "refusee" || status === "pieces_complementaires") ? (
                  <p className="mt-3 text-sm text-amber-100/90">
                    Commentaire : {row.commentaireAdmin}
                  </p>
                ) : null}

                <div className="mt-4 space-y-2">
                  <Label htmlFor={`comment-${key}`}>Commentaire admin</Label>
                  <Textarea
                    id={`comment-${key}`}
                    rows={2}
                    className="border-border bg-noir-secondary/80 text-cream"
                    value={comments[key] ?? row.commentaireAdmin ?? ""}
                    onChange={(e) =>
                      setComments((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    placeholder="Requis pour refus ou pièces complémentaires"
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {status !== "validee" ? (
                    <Button
                      type="button"
                      size="sm"
                      className="btn-cta"
                      disabled={busy}
                      onClick={() => runStatus(row.id, "validee")}
                    >
                      Valider
                    </Button>
                  ) : null}
                  {status !== "pieces_complementaires" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="btn-outline-warm"
                      disabled={busy}
                      onClick={() => runStatus(row.id, "pieces_complementaires")}
                    >
                      Pièces complémentaires
                    </Button>
                  ) : null}
                  {status !== "refusee" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => runStatus(row.id, "refusee")}
                    >
                      Refuser
                    </Button>
                  ) : null}
                  {status !== "en_instruction" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => runStatus(row.id, "en_instruction")}
                    >
                      Remettre en instruction
                    </Button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
