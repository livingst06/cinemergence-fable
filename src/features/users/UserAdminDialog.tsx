"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createUserAction,
  updateUserAction,
} from "@/features/users/users-admin-actions";
import type { AdminUserRow } from "@/lib/admin-users";
import { ASSIGNABLE_ROLES, type AssignableRole } from "@/lib/user-roles";

const fieldClass =
  "border-border bg-noir-tertiary/60 text-cream placeholder:text-muted-text";

const ROLE_LABEL: Record<AssignableRole, string> = {
  eleve: "Élève",
  formateur: "Formateur",
  intervenant: "Intervenant",
};

type UserAdminDialogProps = {
  open: boolean;
  editing: AdminUserRow | null;
  onClose: () => void;
  onSaved: () => void;
};

export function UserAdminDialog({ open, editing, onClose, onSaved }: UserAdminDialogProps) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<AssignableRole>("eleve");

  useEffect(() => {
    if (!open) return;
    setName(editing?.name ?? "");
    setEmail(editing?.email ?? "");
    setPhone(editing?.phone ?? "");
    setRole(editing?.assignableRole ?? "eleve");
  }, [open, editing]);

  if (!open) return null;

  const lockedAdmin = Boolean(editing?.isEnvAdmin);
  const title = editing ? "Modifier l'utilisateur" : "Ajouter un utilisateur";

  const save = () => {
    const input = { name, email, phone, role };
    startTransition(async () => {
      const result = editing
        ? await updateUserAction(editing.id, input)
        : await createUserAction(input);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      onSaved();
      onClose();
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-start justify-center overflow-y-auto bg-noir/70 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-editor-title"
    >
      <div className="my-8 w-full max-w-lg rounded-2xl border border-border bg-noir-secondary p-6 shadow-2xl">
        <h2 id="user-editor-title" className="font-heading text-2xl text-cream">
          {title}
        </h2>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-name">Nom</Label>
            <Input
              id="user-name"
              className={fieldClass}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-email">E-mail</Label>
            <Input
              id="user-email"
              type="email"
              className={fieldClass}
              value={email}
              disabled={lockedAdmin}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-phone">Téléphone</Label>
            <Input
              id="user-phone"
              className={fieldClass}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-role">Rôle</Label>
            <select
              id="user-role"
              className="h-11 w-full rounded-lg border border-border bg-noir-tertiary/60 px-3 text-sm text-cream disabled:opacity-60"
              value={role}
              disabled={lockedAdmin || pending}
              onChange={(event) => setRole(event.target.value as AssignableRole)}
            >
              {ASSIGNABLE_ROLES.map((value) => (
                <option key={value} value={value}>
                  {ROLE_LABEL[value]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Annuler
          </Button>
          <Button type="button" className="btn-convert" onClick={save} disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </div>
    </div>
  );
}
