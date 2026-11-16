import {
  inscriptionStatusLabel,
  normalizeInscriptionStatus,
  type InscriptionStatus,
} from "@/lib/inscription-status";
import { cn } from "@/lib/utils";

const toneByStatus: Record<string, string> = {
  en_instruction: "border-or/30 bg-or/10 text-or-light",
  validee: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  refusee: "border-red-500/30 bg-red-500/10 text-red-200",
  pieces_complementaires: "border-amber-500/30 bg-amber-500/10 text-amber-100",
  annule: "border-border bg-white/5 text-muted-text",
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
        "inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
        toneByStatus[normalized] ?? toneByStatus.en_instruction,
        className,
      )}
    >
      {inscriptionStatusLabel(normalized as InscriptionStatus)}
    </span>
  );
}
