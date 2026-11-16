"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { UserAvatar } from "@/features/profile/UserAvatar";
import { updateAssignableUserRole } from "@/features/users/users-admin-actions";
import type { AdminUserRow } from "@/lib/admin-users";
import {
  SALON_STAFF_ROLE_LABEL,
  staffRoleBadgeClass,
} from "@/lib/salon-constants";
import { ASSIGNABLE_ROLES, type AssignableRole } from "@/lib/user-roles";
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

function matchesFilter(user: AdminUserRow, filter: UserFilter): boolean {
  if (filter === "tous") return true;
  if (filter === "admin") return user.isEnvAdmin || user.role === "admin";
  return !user.isEnvAdmin && user.role === filter;
}

function UserRoleSelect({
  user,
  onChanged,
}: {
  user: AdminUserRow;
  onChanged: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [role, setRole] = useState<AssignableRole>(user.assignableRole);

  const change = (next: AssignableRole) => {
    if (next === role || pending) return;
    const previous = role;
    setRole(next);
    startTransition(async () => {
      const result = await updateAssignableUserRole(user.id, next);
      if (!result.ok) {
        setRole(previous);
        toast.error(result.error);
        return;
      }
      toast.success(`Rôle mis à jour pour ${user.email}`);
      onChanged();
    });
  };

  return (
    <select
      aria-label={`Rôle de ${user.name || user.email}`}
      className="h-10 min-w-[10rem] rounded-lg border border-border bg-noir-tertiary/60 px-3 text-sm text-cream disabled:opacity-60"
      value={role}
      disabled={pending}
      onChange={(event) => change(event.target.value as AssignableRole)}
    >
      {ASSIGNABLE_ROLES.map((value) => (
        <option key={value} value={value}>
          {ASSIGNABLE_LABEL[value]}
        </option>
      ))}
    </select>
  );
}

export function LesUtilisateursAdmin({ users }: LesUtilisateursAdminProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<UserFilter>("tous");
  const visible = useMemo(
    () => users.filter((user) => matchesFilter(user, filter)),
    [users, filter],
  );

  return (
    <>
      <header className="relative overflow-hidden bg-noir pt-6 pb-5 sm:pt-8 sm:pb-6 md:pt-10 md:pb-8">
        <div className="container-page space-y-4">
          <h1 className="display-title text-cream">Les utilisateurs</h1>
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
        <div className="container-page max-w-4xl space-y-4">
          <p className="text-sm text-muted-text">
            Comptes déjà connectés. Le rôle admin vient uniquement de{" "}
            <code className="text-cream/80">ADMIN_LIST</code>. Tu peux attribuer
            élève, formateur ou intervenant aux autres.
          </p>
          {users.length === 0 ? (
            <p className="text-sm text-muted-text">
              Aucun utilisateur connecté pour le moment.
            </p>
          ) : visible.length === 0 ? (
            <p className="text-sm text-muted-text">Aucun compte pour ce filtre.</p>
          ) : (
            <ul className="space-y-3">
              {visible.map((user) => (
                <li
                  key={String(user.id)}
                  className="card-stage flex flex-wrap items-center gap-4 p-4 sm:p-5"
                >
                  <UserAvatar
                    avatarKey={user.avatarKey}
                    name={user.name || user.email}
                    className="size-12 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-cream">
                      {user.name || "Sans nom"}
                    </p>
                    <p className="truncate text-sm text-muted-text">{user.email}</p>
                  </div>
                  {user.isEnvAdmin ? (
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide",
                        staffRoleBadgeClass("admin"),
                      )}
                    >
                      {SALON_STAFF_ROLE_LABEL.admin}
                    </span>
                  ) : (
                    <UserRoleSelect
                      user={user}
                      onChanged={() => router.refresh()}
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
