"use client";

import {
  AdminDeleteButton,
  AdminEditButton,
} from "@/features/admin/AdminMutationButtons";
import { IntervenantCard } from "@/features/intervenants/IntervenantCard";
import type { IntervenantData } from "@/lib/defaults";

type IntervenantCardAdminProps = {
  intervenant: IntervenantData;
  onEdit: () => void;
  onDelete: () => void;
};

export function IntervenantCardAdmin({
  intervenant,
  onEdit,
  onDelete,
}: IntervenantCardAdminProps) {
  const canMutate = intervenant.id != null;
  const disabledReason =
    "Profil hors CMS — crée-le via Ajouter pour le gérer ici.";

  return (
    <div className="relative flex h-full flex-col overflow-visible">
      <AdminDeleteButton
        className="absolute -top-3 -right-3 z-30"
        label={`Supprimer ${intervenant.nom}`}
        onClick={onDelete}
        disabled={!canMutate}
        disabledReason={disabledReason}
      />
      <AdminEditButton
        className="absolute top-3 left-3 z-30"
        label={`Modifier ${intervenant.nom}`}
        onClick={onEdit}
        disabled={!canMutate}
        disabledReason={disabledReason}
      />
      <IntervenantCard intervenant={intervenant} />
    </div>
  );
}
