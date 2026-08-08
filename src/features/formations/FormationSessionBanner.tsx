import { CalendarDays } from "lucide-react";

import { cn } from "@/lib/utils";

type FormationSessionBannerProps = {
  sessionLabel?: string | null;
  placesRestantes?: number | null;
};

export function FormationSessionBanner({
  sessionLabel,
  placesRestantes,
}: FormationSessionBannerProps) {
  if (!sessionLabel && placesRestantes == null) return null;

  const placesLabel =
    placesRestantes == null
      ? null
      : placesRestantes > 0
        ? `${placesRestantes} place${placesRestantes > 1 ? "s" : ""} restante${placesRestantes > 1 ? "s" : ""}`
        : "Complet";

  return (
    <aside
      className="w-full overflow-hidden rounded-2xl border border-projector/35 bg-gradient-to-br from-projector/20 via-projector/10 to-or/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
      aria-label="Dates de la session"
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <span className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-xl bg-projector/25 text-projector-light ring-1 ring-projector/40">
            <CalendarDays className="size-5" aria-hidden strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-projector-light">
              Session à venir
            </p>
            {sessionLabel ? (
              <p className="mt-1.5 font-heading text-xl leading-snug text-cream sm:text-2xl">
                {sessionLabel}
              </p>
            ) : (
              <p className="mt-1.5 text-sm text-muted-text">Dates à confirmer</p>
            )}
          </div>
        </div>

        {placesLabel ? (
          <span
            className={cn(
              "inline-flex w-fit shrink-0 items-center rounded-full px-3.5 py-2 text-xs font-semibold uppercase tracking-wider",
              placesRestantes != null && placesRestantes > 0
                ? "bg-emerald-600 text-white"
                : "bg-emerald-950/80 text-emerald-100/90 ring-1 ring-emerald-500/30",
            )}
          >
            {placesLabel}
          </span>
        ) : null}
      </div>
    </aside>
  );
}
