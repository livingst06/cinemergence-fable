"use client";

import { FormationCard } from "@/features/formations/FormationCard";
import { AdminMutationButtons } from "@/features/admin/AdminMutationButtons";
import type { FormationData } from "@/lib/defaults";

type FormationCardAdminProps = {
  formation: FormationData;
  onEdit: () => void;
  onDelete: () => void;
};

export function FormationCardAdmin({
  formation,
  onEdit,
  onDelete,
}: FormationCardAdminProps) {
  return (
    <div className="relative flex h-full flex-col">
      <FormationCard formation={formation} />
      <AdminMutationButtons
        className="absolute top-3 right-3 z-30"
        editLabel={`Modifier ${formation.titreCourt}`}
        deleteLabel={`Supprimer ${formation.titreCourt}`}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
