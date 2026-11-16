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
        "inline-flex items-center rounded-full font-semibold uppercase tracking-wide",
        tone === "admin"
          ? "border border-emerald-800 bg-emerald-600 px-3 py-1 text-xs font-semibold tracking-wide text-white shadow-sm dark:border-emerald-200 dark:bg-emerald-400 dark:text-emerald-950"
          : "border border-projector/50 bg-projector px-4 py-1.5 text-sm text-cream shadow-[0_0_16px_-2px_var(--projector-glow)] sm:px-5 sm:py-2 sm:text-base",
        className,
      )}
    >
      Complet
    </span>
  );
}
