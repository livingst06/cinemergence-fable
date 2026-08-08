"use client";

import { Pencil, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminActionButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  disabledReason?: string;
  className?: string;
};

/** Bouton Modifier — design cards formations. */
export function AdminEditButton({
  label,
  onClick,
  disabled = false,
  disabledReason,
  className,
}: AdminActionButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={label}
      title={disabled ? disabledReason : "Modifier"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;
        onClick();
      }}
      className={cn(
        "inline-flex min-h-9 items-center gap-1.5 rounded-full border border-orange-600/40 bg-orange-500 px-3 py-2 text-xs font-semibold tracking-tight text-white shadow-lg transition-colors hover:bg-orange-400",
        disabled && "cursor-not-allowed opacity-50 hover:bg-orange-500",
        className,
      )}
    >
      <Pencil className="size-3.5 shrink-0" aria-hidden strokeWidth={2.2} />
      <span>Modifier</span>
    </button>
  );
}

/** Croix Supprimer — design cards formations. */
export function AdminDeleteButton({
  label,
  onClick,
  disabled = false,
  disabledReason,
  className,
}: AdminActionButtonProps) {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      disabled={disabled}
      aria-label={label}
      title={disabled ? disabledReason : "Supprimer"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;
        onClick();
      }}
      className={cn(
        "h-10 w-10 rounded-full border border-red-600/50 bg-red-500 text-white shadow-lg hover:border-red-500 hover:bg-red-600 hover:text-white",
        disabled &&
          "cursor-not-allowed opacity-50 hover:border-red-600/50 hover:bg-red-500 hover:text-white",
        className,
      )}
    >
      <X className="size-5 shrink-0" aria-hidden strokeWidth={2} />
    </Button>
  );
}

type AdminMutationButtonsProps = {
  editLabel: string;
  deleteLabel: string;
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
  disabledReason?: string;
  className?: string;
};

/** Boutons Modifier + Supprimer côte à côte (cards formations). */
export function AdminMutationButtons({
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
  disabled = false,
  disabledReason,
  className,
}: AdminMutationButtonsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <AdminEditButton
        label={editLabel}
        onClick={onEdit}
        disabled={disabled}
        disabledReason={disabledReason}
      />
      <AdminDeleteButton
        label={deleteLabel}
        onClick={onDelete}
        disabled={disabled}
        disabledReason={disabledReason}
      />
    </div>
  );
}
