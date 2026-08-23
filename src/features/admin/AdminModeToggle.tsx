"use client";

import { cn } from "@/lib/utils";
import { useAdminUi } from "@/features/admin/AdminUiContext";

export function AdminModeToggle({ className }: { className?: string }) {
  const { isAdminEligible, isAdminMode, toggleAdminMode } = useAdminUi();

  if (!isAdminEligible) return null;

  return (
    <button
      type="button"
      onClick={toggleAdminMode}
      aria-label={isAdminMode ? "Désactiver le mode admin" : "Activer le mode admin"}
      aria-pressed={isAdminMode}
      className={cn(
        "relative z-[100] flex h-9 shrink-0 items-center rounded-full border px-3 text-sm font-medium shadow-sm backdrop-blur-md transition-colors duration-200",
        isAdminMode
          ? "border-emerald-500 bg-emerald-600 text-white hover:bg-emerald-500 dark:border-emerald-400 dark:bg-emerald-500 dark:text-emerald-950 dark:hover:bg-emerald-400"
          : "border-border/70 bg-noir-tertiary/70 text-cream/75 hover:border-border hover:text-cream",
        className,
      )}
    >
      Admin
    </button>
  );
}
