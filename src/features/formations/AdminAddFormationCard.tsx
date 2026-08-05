"use client";

import { Plus } from "lucide-react";

type AdminAddFormationCardProps = {
  onAdd: () => void;
};

export function AdminAddFormationCard({ onAdd }: AdminAddFormationCardProps) {
  return (
    <button
      type="button"
      onClick={onAdd}
      aria-label="Ajouter une formation"
      className="card-stage group flex h-full min-h-[18rem] w-full flex-col items-center justify-center gap-3 border-dashed border-or/30 bg-noir-tertiary/40 p-6 text-center transition-colors hover:border-or/50 hover:bg-noir-tertiary/70"
    >
      <Plus
        className="size-11 text-cream/50 transition-colors group-hover:text-or-light"
        strokeWidth={1.75}
        aria-hidden
      />
      <p className="text-sm font-medium text-cream/70 transition-colors group-hover:text-cream">
        Ajouter une formation
      </p>
    </button>
  );
}
