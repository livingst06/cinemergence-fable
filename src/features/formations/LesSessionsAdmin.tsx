"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import { toast } from "sonner";

import { useAdminUi } from "@/features/admin/AdminUiContext";
import { AdminAddSessionCard } from "@/features/formations/AdminAddSessionCard";
import { AdminDeleteConfirmDialog } from "@/features/formations/AdminDeleteConfirmDialog";
import { AdminSessionDialog } from "@/features/formations/AdminSessionDialog";
import {
  SessionsCalendar,
  type CalendarMode,
} from "@/features/formations/SessionsCalendar";
import type {
  FormationOption,
  IntervenantOption,
} from "@/features/formations/session-actions";
import { deleteFormationSession } from "@/features/formations/session-actions";
import {
  AdminDemandesPanel,
  type AdminSessionGroup,
} from "@/features/inscriptions/AdminDemandesPanel";
import { formatFormationSessionLabel } from "@/lib/inscription-status";
import { cn } from "@/lib/utils";

type LesSessionsAdminProps = {
  sessions: AdminSessionGroup[];
  formations: FormationOption[];
  intervenants: IntervenantOption[];
};

type ViewMode = "list" | "calendar";

export function LesSessionsAdmin({
  sessions,
  formations,
  intervenants,
}: LesSessionsAdminProps) {
  const { isAdminMode } = useAdminUi();
  const router = useRouter();
  const [view, setView] = useState<ViewMode>("list");
  const [calendarMode, setCalendarMode] = useState<CalendarMode>("week");
  const [cursor, setCursor] = useState(() => new Date());
  const [expandedSessionId, setExpandedSessionId] = useState<
    number | string | null
  >(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<AdminSessionGroup | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminSessionGroup | null>(
    null,
  );
  const [deletePending, startDelete] = useTransition();

  const openCreate = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = (session: AdminSessionGroup) => {
    setEditing(session);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditing(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const id = deleteTarget.sessionId;
    startDelete(async () => {
      const result = await deleteFormationSession(id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      setDeleteTarget(null);
      router.refresh();
    });
  };

  const deleteTitle = deleteTarget
    ? [
        deleteTarget.formationTitre,
        deleteTarget.label ||
          formatFormationSessionLabel(
            deleteTarget.dateDebut,
            deleteTarget.dateFin,
            { month: "long" },
          ),
      ]
        .filter(Boolean)
        .join(" — ")
    : "";

  return (
    <>
      <header className="relative overflow-hidden bg-noir pt-10 pb-8 md:pt-16 md:pb-14">
        <div className="container-page">
          <p className="eyebrow mb-3 md:mb-4">Administration</p>
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <h1 className="display-title min-w-0 flex-1 text-cream">
              Les sessions
            </h1>
            <button
              type="button"
              aria-label={
                view === "calendar"
                  ? "Revenir à la vue liste"
                  : "Afficher la vue calendrier"
              }
              aria-pressed={view === "calendar"}
              onClick={() =>
                setView((v) => (v === "list" ? "calendar" : "list"))
              }
              className={cn(
                "mt-0.5 inline-flex size-11 shrink-0 items-center justify-center rounded-xl border transition-colors touch-manipulation sm:mt-1 sm:size-10",
                view === "calendar"
                  ? "border-or/40 bg-or/15 text-or-light"
                  : "border-border bg-card text-cream hover:border-or/30 hover:bg-noir-tertiary/50",
              )}
            >
              <Calendar className="size-5" aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <section className="py-10 md:py-20 lg:py-28">
        <div
          className={cn(
            "container-page min-w-0",
            view === "calendar" ? "max-w-6xl" : "max-w-4xl",
          )}
        >
          <div className="min-w-0 space-y-6">
            {view === "list" ? (
              <>
                <AdminDemandesPanel
                  sessions={sessions}
                  isAdminMode={isAdminMode}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                  expandedSessionId={expandedSessionId}
                  onExpandedSessionIdChange={setExpandedSessionId}
                />
                {isAdminMode ? (
                  <AdminAddSessionCard onAdd={openCreate} />
                ) : null}
              </>
            ) : (
              <SessionsCalendar
                sessions={sessions}
                mode={calendarMode}
                cursor={cursor}
                onModeChange={setCalendarMode}
                onCursorChange={setCursor}
              />
            )}

            <AdminSessionDialog
              open={editorOpen}
              formations={formations}
              intervenants={intervenants}
              editing={editing}
              onClose={closeEditor}
            />

            <AdminDeleteConfirmDialog
              open={Boolean(deleteTarget)}
              title={deleteTitle}
              entityLabel="session"
              pending={deletePending}
              onConfirm={confirmDelete}
              onCancel={() => setDeleteTarget(null)}
            />
          </div>
        </div>
      </section>
    </>
  );
}
