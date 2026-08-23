"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calendar, List } from "lucide-react";
import { toast } from "sonner";

import { AdminOutilsNav } from "@/features/admin/AdminOutilsNav";
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
  SessionStaffOption,
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
  staffUsers: SessionStaffOption[];
};

type ViewMode = "list" | "calendar";

export function LesSessionsAdmin({
  sessions,
  formations,
  staffUsers,
}: LesSessionsAdminProps) {
  const { isAdminMode } = useAdminUi();
  const router = useRouter();
  const [view, setView] = useState<ViewMode>("list");
  const [calendarMode, setCalendarMode] = useState<CalendarMode>("month");
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
      <header className="relative overflow-hidden bg-noir pt-6 pb-5 sm:pt-8 sm:pb-6 md:pt-10 md:pb-8">
        <div className="container-page space-y-4">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
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
                "inline-flex size-12 shrink-0 items-center justify-center rounded-xl border transition-colors touch-manipulation sm:size-14",
                "border-border bg-card text-cream hover:border-or/30 hover:bg-noir-tertiary/50",
              )}
            >
              {view === "calendar" ? (
                <List className="size-6 sm:size-7" aria-hidden strokeWidth={2.25} />
              ) : (
                <Calendar className="size-6 sm:size-7" aria-hidden strokeWidth={2.25} />
              )}
            </button>
          </div>
          <AdminOutilsNav current="sessions" />
        </div>
      </header>

      <section className="py-5 sm:py-6 md:py-8">
        <div
          className={cn(
            "container-page min-w-0",
            view === "calendar" ? "max-w-6xl" : "max-w-4xl",
          )}
        >
          <div className="min-w-0 space-y-4 sm:space-y-5">
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
              staffUsers={staffUsers}
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
