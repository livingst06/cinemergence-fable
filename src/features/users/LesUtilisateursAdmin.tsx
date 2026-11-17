"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { useAdminUi } from "@/features/admin/AdminUiContext";
import { AdminDeleteButton, AdminEditButton } from "@/features/admin/AdminMutationButtons";
import { AdminDeleteConfirmDialog } from "@/features/formations/AdminDeleteConfirmDialog";
import { UserAvatar } from "@/features/profile/UserAvatar";
import { UserAdminDialog } from "@/features/users/UserAdminDialog";
import { deleteUserAction } from "@/features/users/users-admin-actions";
import type { AdminUserRow } from "@/lib/admin-users";
import {
  SALON_STAFF_ROLE_LABEL,
  staffRoleBadgeClass,
} from "@/lib/salon-constants";
import type { AssignableRole } from "@/lib/user-roles";
import { cn } from "@/lib/utils";

const ASSIGNABLE_LABEL: Record<AssignableRole, string> = {
  eleve: "Élève",
  formateur: "Formateur",
  intervenant: "Intervenant",
};

type LesUtilisateursAdminProps = {
  users: AdminUserRow[];
};

type UserFilter = "tous" | "eleve" | "intervenant" | "formateur" | "admin";

const FILTERS: { id: UserFilter; label: string }[] = [
  { id: "tous", label: "Tous" },
  { id: "eleve", label: "Les élèves" },
  { id: "intervenant", label: "Les intervenants" },
  { id: "formateur", label: "Les formateurs" },
  { id: "admin", label: "Les admin" },
];

function isAdminUser(user: AdminUserRow): boolean {
  return user.isEnvAdmin || user.role === "admin";
}

function matchesFilter(user: AdminUserRow, filter: UserFilter): boolean {
  if (filter === "tous") return true;
  if (filter === "admin") return isAdminUser(user);
  return !isAdminUser(user) && user.role === filter;
}

const TOUS_GROUPS: { id: Exclude<UserFilter, "tous">; label: string }[] = [
  { id: "formateur", label: "Les formateurs" },
  { id: "intervenant", label: "Les intervenants" },
  { id: "admin", label: "Les admin" },
  { id: "eleve", label: "Les élèves" },
];

function roleBadge(user: AdminUserRow): { label: string; className: string } {
  if (isAdminUser(user)) {
    return { label: SALON_STAFF_ROLE_LABEL.admin, className: staffRoleBadgeClass("admin") };
  }
  const role = user.assignableRole;
  if (role === "eleve") {
    return { label: ASSIGNABLE_LABEL.eleve, className: "bg-white/10 text-cream/80" };
  }
  return { label: ASSIGNABLE_LABEL[role], className: staffRoleBadgeClass(role) };
}

function UserRow({
  user,
  isAdminMode,
  onEdit,
  onDelete,
}: {
  user: AdminUserRow;
  isAdminMode: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const badge = roleBadge(user);
  return (
    <li className="card-stage flex flex-wrap items-center gap-4 p-4 sm:p-5">
      <UserAvatar
        avatarKey={user.avatarKey}
        name={user.name || user.email}
        className="size-12 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-cream">{user.name || "Sans nom"}</p>
        <p className="truncate text-sm text-muted-text">{user.email}</p>
        {user.phone ? (
          <p className="truncate text-sm text-muted-text">{user.phone}</p>
        ) : null}
      </div>
      <span
        className={cn(
          "rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide",
          badge.className,
        )}
      >
        {badge.label}
      </span>
      {isAdminMode ? (
        <div className="flex items-center gap-2">
          <AdminEditButton label={`Modifier ${user.email}`} onClick={onEdit} />
          <AdminDeleteButton
            label={`Supprimer ${user.email}`}
            disabled={user.isEnvAdmin}
            disabledReason="Un admin ne se supprime pas ici"
            onClick={onDelete}
          />
        </div>
      ) : null}
    </li>
  );
}

export function LesUtilisateursAdmin({ users }: LesUtilisateursAdminProps) {
  const router = useRouter();
  const { isAdminMode } = useAdminUi();
  const [filter, setFilter] = useState<UserFilter>("tous");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUserRow | null>(null);
  const [deleting, setDeleting] = useState<AdminUserRow | null>(null);
  const [deletePending, startDelete] = useTransition();
  const visible = useMemo(
    () => users.filter((user) => matchesFilter(user, filter)),
    [users, filter],
  );
  useEffect(() => {
    if (isAdminMode) return;
    setEditorOpen(false);
    setDeleting(null);
  }, [isAdminMode]);

  const refresh = () => router.refresh();
  const openCreate = () => {
    setEditing(null);
    setEditorOpen(true);
  };
  const openEdit = (user: AdminUserRow) => {
    setEditing(user);
    setEditorOpen(true);
  };
  const confirmDelete = () => {
    if (!deleting) return;
    startDelete(async () => {
      const result = await deleteUserAction(deleting.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      setDeleting(null);
      refresh();
    });
  };

  return (
    <>
      <header className="relative overflow-hidden bg-noir pt-6 pb-5 sm:pt-8 sm:pb-6 md:pt-10 md:pb-8">
        <div className="container-page space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="display-title text-cream">Les utilisateurs</h1>
            {isAdminMode ? (
              <Button type="button" className="btn-convert" onClick={openCreate}>
                Ajouter un utilisateur
              </Button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer les utilisateurs">
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
        </div>
      </header>

      <section className="py-5 sm:py-6 md:py-8">
        <div className="container-page max-w-4xl space-y-8">
          {users.length === 0 ? (
            <p className="text-sm text-muted-text">
              Aucun utilisateur pour le moment.
            </p>
          ) : visible.length === 0 ? (
            <p className="text-sm text-muted-text">Aucun compte pour ce filtre.</p>
          ) : filter === "tous" ? (
            TOUS_GROUPS.map((group) => {
              const rows = users.filter((user) => matchesFilter(user, group.id));
              if (rows.length === 0) return null;
              return (
                <section key={group.id} className="space-y-3">
                  <h2 className="da-rule font-heading text-xl font-semibold text-cream">
                    {group.label}
                  </h2>
                  <ul className="space-y-3">
                    {rows.map((user) => (
                      <UserRow
                        key={String(user.id)}
                        user={user}
                        isAdminMode={isAdminMode}
                        onEdit={() => openEdit(user)}
                        onDelete={() => setDeleting(user)}
                      />
                    ))}
                  </ul>
                </section>
              );
            })
          ) : (
            <ul className="space-y-3">
              {visible.map((user) => (
                <UserRow
                  key={String(user.id)}
                  user={user}
                  isAdminMode={isAdminMode}
                  onEdit={() => openEdit(user)}
                  onDelete={() => setDeleting(user)}
                />
              ))}
            </ul>
          )}
        </div>
      </section>
      <UserAdminDialog
        open={editorOpen}
        editing={editing}
        onClose={() => setEditorOpen(false)}
        onSaved={refresh}
      />
      <AdminDeleteConfirmDialog
        open={deleting != null}
        title={deleting?.name || deleting?.email || "cet utilisateur"}
        entityLabel="fiche utilisateur"
        pending={deletePending}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
