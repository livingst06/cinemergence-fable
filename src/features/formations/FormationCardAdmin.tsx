"use client";

import { Pencil, X } from "lucide-react";

import { FormationCard } from "@/features/formations/FormationCard";
import type { FormationData } from "@/lib/defaults";
import { Button } from "@/components/ui/button";

type FormationCardAdminProps = {
  formation: FormationData;
  onEdit: () => void;
  onDelete: () => void;
};

export function FormationCardAdmin({ formation, onEdit, onDelete }: FormationCardAdminProps) {
  return (
    <div className="relative h-full">
      <FormationCard formation={formation} />
      <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
        <button
          type="button"
          aria-label={`Modifier ${formation.titreCourt}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit();
          }}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-or/45 bg-or/90 px-3 py-2 text-xs font-semibold tracking-tight text-noir shadow-lg transition-colors hover:bg-or"
        >
          <Pencil className="size-3.5 shrink-0" aria-hidden strokeWidth={2.2} />
          <span>Modifier</span>
        </button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label={`Supprimer ${formation.titreCourt}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          className="h-10 w-10 rounded-full border border-border bg-noir-secondary/90 text-cream shadow-lg hover:border-red-500/40 hover:bg-red-500/90 hover:text-white"
        >
          <X className="size-5 shrink-0" aria-hidden strokeWidth={2} />
        </Button>
      </div>
    </div>
  );
}
