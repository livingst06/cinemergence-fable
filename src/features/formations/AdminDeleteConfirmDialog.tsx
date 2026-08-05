"use client";

import { Button } from "@/components/ui/button";

type AdminDeleteConfirmDialogProps = {
  open: boolean;
  title: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function AdminDeleteConfirmDialog({
  open,
  title,
  pending,
  onConfirm,
  onCancel,
}: AdminDeleteConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-noir/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-formation-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-noir-secondary p-6 shadow-2xl">
        <h2 id="delete-formation-title" className="font-heading text-2xl text-cream">
          Supprimer la formation ?
        </h2>
        <p className="mt-3 text-sm text-muted-text text-pretty">
          Tu vas supprimer « {title} ». Cette action est définitive.
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? "Suppression…" : "Je confirme la suppression"}
          </Button>
        </div>
      </div>
    </div>
  );
}
