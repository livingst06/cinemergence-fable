"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAdminUi } from "@/features/admin/AdminUiContext";
import { AdminAddSessionCard } from "@/features/formations/AdminAddSessionCard";
import { AdminDeleteConfirmDialog } from "@/features/formations/AdminDeleteConfirmDialog";
import { AdminSessionDialog } from "@/features/formations/AdminSessionDialog";
import type { FormationOption } from "@/features/formations/session-actions";
import { deleteFormationSession } from "@/features/formations/session-actions";
import {
  AdminDemandesPanel,
  type AdminSessionGroup,
} from "@/features/inscriptions/AdminDemandesPanel";
import { formatFormationSessionLabel } from "@/lib/inscription-status";

type LesSessionsAdminProps = {
  sessions: AdminSessionGroup[];
  formations: FormationOption[];
};

export function LesSessionsAdmin({
  sessions,
  formations,
}: LesSessionsAdminProps) {
  const { isAdminMode } = useAdminUi();
  const router = useRouter();
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
    <div className="space-y-6">
      <AdminDemandesPanel
        sessions={sessions}
        isAdminMode={isAdminMode}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
      />

      {isAdminMode ? <AdminAddSessionCard onAdd={openCreate} /> : null}

      <AdminSessionDialog
        open={editorOpen}
        formations={formations}
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
  );
}
