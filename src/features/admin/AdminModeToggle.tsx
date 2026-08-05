"use client";

import { cn } from "@/lib/utils";
import { useAdminUi } from "@/features/admin/AdminUiContext";

export function AdminModeToggle({ className }: { className?: string }) {
  const { isAdminEligible, isAdminMode, toggleAdminMode } = useAdminUi();

  if (!isAdminEligible) return null;

  return (
    <div className={cn("relative z-[100] shrink-0", className)}>
      <button
        type="button"
        onClick={toggleAdminMode}
        aria-label={isAdminMode ? "Désactiver le mode admin" : "Activer le mode admin"}
        aria-pressed={isAdminMode}
        className={cn(
          "relative flex h-8 w-[4.75rem] shrink-0 items-center rounded-full border px-1 transition-colors duration-300",
          isAdminMode
            ? "border-or/45 bg-or/25"
            : "border-border bg-noir-tertiary/80",
        )}
      >
        <span
          className={cn(
            "pointer-events-none absolute inset-x-0 text-center text-[9px] font-bold uppercase tracking-wider transition-colors",
            isAdminMode ? "text-or-light" : "text-cream/55",
          )}
        >
          {isAdminMode ? "Admin" : "Off"}
        </span>
        <span
          className={cn(
            "pointer-events-none absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-cream shadow-md transition-transform duration-300",
            isAdminMode ? "left-1 translate-x-[2.35rem]" : "left-1 translate-x-0",
          )}
          aria-hidden
        />
      </button>
    </div>
  );
}
