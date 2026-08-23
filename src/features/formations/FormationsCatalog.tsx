"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { useAdminUi } from "@/features/admin/AdminUiContext";
import { AdminAddFormationCard } from "@/features/formations/AdminAddFormationCard";
import { AdminDeleteConfirmDialog } from "@/features/formations/AdminDeleteConfirmDialog";
import { AdminFormationDialog } from "@/features/formations/AdminFormationDialog";
import { FormationCard } from "@/features/formations/FormationCard";
import { FormationCardAdmin } from "@/features/formations/FormationCardAdmin";
import { deleteFormationAction } from "@/features/formations/admin-actions";
import type { FormationData } from "@/lib/defaults";
import { cn } from "@/lib/utils";

type FormationsCatalogProps = {
  formations: FormationData[];
};

type AudienceFilter = "tous" | "intermittent" | "entreprise";

const audienceLabels: Record<AudienceFilter, string> = {
  tous: "Tous publics",
  intermittent: "Intermittents",
  entreprise: "Entreprise",
};

export function FormationsCatalog({ formations }: FormationsCatalogProps) {
  const { isAdminMode } = useAdminUi();
  const router = useRouter();
  const poles = useMemo(() => {
    const unique = Array.from(new Set(formations.map((f) => f.pole))).sort((a, b) =>
      a.localeCompare(b, "fr"),
    );
    return ["Tous", ...unique];
  }, [formations]);

  const [pole, setPole] = useState("Tous");
  const [audience, setAudience] = useState<AudienceFilter>("tous");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<FormationData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FormationData | null>(null);
  const [deletePending, startDelete] = useTransition();

  const filtered = useMemo(() => {
    let list = formations;
    if (audience !== "tous") {
      list = list.filter((f) => f.audience === audience);
    }
    if (pole !== "Tous") {
      list = list.filter((f) => f.pole === pole);
    }
    return [...list].sort((a, b) => Number(b.prioritaire) - Number(a.prioritaire));
  }, [formations, pole, audience]);

  const featured = filtered.filter((f) => f.prioritaire);
  const others = filtered.filter((f) => !f.prioritaire);
  const ordered = [...featured, ...others];

  const refresh = () => router.refresh();

  const confirmDelete = () => {
    if (!deleteTarget?.id) {
      toast.error("Cette formation n’a pas d’ID CMS — impossible de la supprimer ici.");
      setDeleteTarget(null);
      return;
    }
    const id = deleteTarget.id;
    startDelete(async () => {
      const result = await deleteFormationAction(id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      setDeleteTarget(null);
      refresh();
    });
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Filtrer par public">
        {(Object.keys(audienceLabels) as AudienceFilter[]).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={audience === key}
            onClick={() => setAudience(key)}
            className={cn(
              "min-h-11 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
              audience === key
                ? "border-or/40 bg-or/15 text-cream"
                : "border-white/10 bg-transparent text-cream/70 hover:border-or/30 hover:text-or-light",
            )}
          >
            {audienceLabels[key]}
          </button>
        ))}
      </div>

      <div className="mb-10 flex flex-wrap gap-2" role="tablist" aria-label="Filtrer par pôle">
        {poles.map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={pole === p}
            onClick={() => setPole(p)}
            className={cn(
              "min-h-11 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
              pole === p
                ? "border-projector/40 bg-projector/15 text-cream"
                : "border-white/10 bg-transparent text-cream/70 hover:border-or/30 hover:text-or-light",
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {ordered.length > 0 || isAdminMode ? (
        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-5">
          {ordered.map((f) =>
            isAdminMode ? (
              <FormationCardAdmin
                key={f.slug}
                formation={f}
                onEdit={() => {
                  if (f.id == null) {
                    toast.error("Formation hors CMS — édite-la dans Payload après seed.");
                    return;
                  }
                  setEditing(f);
                  setEditorOpen(true);
                }}
                onDelete={() => setDeleteTarget(f)}
              />
            ) : (
              <FormationCard key={f.slug} formation={f} />
            ),
          )}
          {isAdminMode && (
            <AdminAddFormationCard
              onAdd={() => {
                setEditing(null);
                setEditorOpen(true);
              }}
            />
          )}
        </div>
      ) : (
        <p className="text-center text-muted-text">
          Aucune formation pour ce filtre pour le moment.
        </p>
      )}

      <AdminFormationDialog
        open={editorOpen}
        formation={editing}
        onClose={() => {
          setEditorOpen(false);
          setEditing(null);
        }}
        onSaved={refresh}
      />

      <AdminDeleteConfirmDialog
        open={Boolean(deleteTarget)}
        title={deleteTarget?.titreCourt ?? ""}
        pending={deletePending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
