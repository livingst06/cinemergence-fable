import {
  PAIEMENT_STATUS_LABELS,
  PAIEMENT_STATUS_TONES,
  type PaiementStatus,
} from "@/lib/paiement-status";
import { cn } from "@/lib/utils";

export function PaiementStatusBadge({
  status,
  className,
}: {
  status: PaiementStatus;
  className?: string;
}) {
  return (
    <span
      className={cn("status-badge", PAIEMENT_STATUS_TONES[status], className)}
    >
      {PAIEMENT_STATUS_LABELS[status]}
    </span>
  );
}
