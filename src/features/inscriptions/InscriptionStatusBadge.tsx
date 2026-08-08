import {
  inscriptionStatusLabel,
  normalizeInscriptionStatus,
  type InscriptionStatus,
} from "@/lib/inscription-status";
import { cn } from "@/lib/utils";

/** Tons avec contraste jour/nuit (voir `.status-badge-*` dans globals.css). */
const toneByStatus: Record<string, string> = {
  en_instruction: "status-badge-or",
  en_paiement: "status-badge-amber",
  payee: "status-badge-success",
  validee: "status-badge-success",
  refusee: "status-badge-danger",
  pieces_complementaires: "status-badge-amber",
  annule: "status-badge-muted",
};

export function InscriptionStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const normalized = normalizeInscriptionStatus(status);
  return (
    <span
      className={cn(
        "status-badge",
        toneByStatus[normalized] ?? toneByStatus.en_instruction,
        className,
      )}
    >
      {inscriptionStatusLabel(normalized as InscriptionStatus)}
    </span>
  );
}
