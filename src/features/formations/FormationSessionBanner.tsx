import { CalendarDays } from "lucide-react";

type FormationSessionBannerProps = {
  sessionLabel?: string | null;
  placesRestantes?: number | null;
};

export function FormationSessionBanner({
  sessionLabel,
  placesRestantes,
}: FormationSessionBannerProps) {
  if (!sessionLabel && placesRestantes == null) return null;

  const placesText =
    placesRestantes == null
      ? null
      : placesRestantes > 0
        ? `Il reste ${placesRestantes} place${placesRestantes > 1 ? "s" : ""}`
        : "Complet — plus de place disponible";

  return (
    <aside
      className="w-full overflow-hidden rounded-2xl border border-projector/35 bg-gradient-to-br from-projector/20 via-projector/10 to-or/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
      aria-label="Dates de la session"
    >
      <div className="flex items-start gap-3 p-5 sm:gap-4 sm:p-6">
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
          {placesText ? (
            <p
              className={
                placesRestantes != null && placesRestantes > 0
                  ? "mt-2 text-base font-semibold text-emerald-700 dark:text-emerald-400 sm:text-lg"
                  : "mt-2 text-base font-semibold text-muted-text sm:text-lg"
              }
            >
              {placesText}
            </p>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
