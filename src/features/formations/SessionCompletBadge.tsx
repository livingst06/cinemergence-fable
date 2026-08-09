import { cn } from "@/lib/utils";

type SessionCompletBadgeProps = {
  /** Admin (/les-sessions) = vert · public (fiche formation) = rouge projecteur */
  tone?: "admin" | "public";
  className?: string;
};

export function SessionCompletBadge({
  tone = "admin",
  className,
}: SessionCompletBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-bold uppercase tracking-[0.14em]",
        tone === "admin"
          ? "status-badge status-badge-success px-3 py-1 text-[11px]"
          : "border border-projector/50 bg-projector px-4 py-1.5 text-sm text-cream shadow-[0_0_16px_-2px_var(--projector-glow)] sm:px-5 sm:py-2 sm:text-base",
        className,
      )}
    >
      Complet
    </span>
  );
}
