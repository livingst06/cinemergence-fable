"use client";

import { Plus } from "lucide-react";

type AdminAddSessionCardProps = {
  onAdd: () => void;
};

export function AdminAddSessionCard({ onAdd }: AdminAddSessionCardProps) {
  return (
    <button
      type="button"
      onClick={onAdd}
      aria-label="Ajouter une session"
      className="card-stage group flex min-h-[10rem] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-or/30 bg-noir-tertiary/40 p-6 text-center transition-colors hover:border-or/50 hover:bg-noir-tertiary/70"
    >
      <Plus
        className="size-11 text-cream/50 transition-colors group-hover:text-or-light"
        strokeWidth={1.75}
        aria-hidden
      />
      <p className="text-sm font-medium text-cream/70 transition-colors group-hover:text-cream">
        Ajouter une session
      </p>
    </button>
  );
}
