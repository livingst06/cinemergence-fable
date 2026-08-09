"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type {
  AdminSessionGroup,
  AdminSessionTrainee,
} from "@/features/inscriptions/AdminDemandesPanel";
import {
  formatFormationSessionLabel,
  normalizeInscriptionStatus,
} from "@/lib/inscription-status";
import {
  addDays,
  formatMonthPeriodLabel,
  formatWeekPeriodLabel,
  formatWeekPeriodLabelCompact,
  isSameDay,
  isSameMonth,
  layoutMonthBands,
  layoutWeekBands,
  monthGrid,
  parseDayKey,
  pastelForId,
  segmentBatteryFill,
  sessionOccupancyRatio,
  toDayKey,
  weekDays,
  weekdayLetterLabel,
  weekdayShortLabel,
} from "@/lib/session-calendar";
import { cn } from "@/lib/utils";

export type CalendarMode = "week" | "month";

type SessionsCalendarProps = {
  sessions: AdminSessionGroup[];
  mode: CalendarMode;
  cursor: Date;
  onModeChange: (mode: CalendarMode) => void;
  onCursorChange: (next: Date) => void;
};

function sessionById(
  sessions: AdminSessionGroup[],
  id: number | string,
): AdminSessionGroup | undefined {
  return sessions.find((s) => String(s.sessionId) === String(id));
}

function isEnrolled(status: string): boolean {
  const s = normalizeInscriptionStatus(status);
  return s === "payee" || s === "validee" || s === "inscrit";
}

function enrolledTrainees(trainees: AdminSessionTrainee[]): AdminSessionTrainee[] {
  return trainees.filter((t) => isEnrolled(t.status));
}

function DayHeaderLabel({ d }: { d: Date }) {
  return (
    <>
      <span className="sm:hidden">{weekdayLetterLabel(d)}</span>
      <span className="hidden sm:inline">{weekdayShortLabel(d)}</span>
    </>
  );
}

function BandChip({
  session,
  continuesBefore = false,
  continuesAfter = false,
  segmentStart,
  segmentEnd,
  className,
  style,
}: {
  session: AdminSessionGroup;
  continuesBefore?: boolean;
  continuesAfter?: boolean;
  segmentStart: Date;
  segmentEnd: Date;
  className?: string;
  style?: CSSProperties;
}) {
  const tipId = useId();
  const bandRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const enrolled = enrolledTrainees(session.trainees);
  const fillRatio = sessionOccupancyRatio(
    enrolled.length,
    session.placesOffertes,
  );
  const fillPct = Math.round(fillRatio * 100);
  const pastel = pastelForId(session.formationId);
  const battery = segmentBatteryFill({
    fillRatio,
    sessionStart: parseDayKey(toDayKey(session.dateDebut)),
    sessionEnd: parseDayKey(toDayKey(session.dateFin)),
    segmentStart,
    segmentEnd,
  });
  const sessionLabel =
    formatFormationSessionLabel(session.dateDebut, session.dateFin, {
      month: "long",
    }) ?? "";

  const radiusClass = cn(
    !continuesBefore && !continuesAfter && "rounded-full",
    !continuesBefore && continuesAfter && "rounded-l-full rounded-r-none",
    continuesBefore && !continuesAfter && "rounded-l-none rounded-r-full",
    continuesBefore && continuesAfter && "rounded-none",
  );

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const updateCoords = useCallback(() => {
    const el = bandRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const tipWidth = Math.min(260, window.innerWidth - 24);
    const tipHeight = 220;
    const left = Math.min(
      Math.max(12, rect.left + rect.width / 2 - tipWidth / 2),
      window.innerWidth - tipWidth - 12,
    );
    const below = rect.bottom + 8;
    const above = rect.top - tipHeight - 8;
    const top =
      below + tipHeight > window.innerHeight - 12 && above > 12 ? above : below;
    setCoords({ top, left, width: tipWidth });
  }, []);

  const show = () => {
    clearCloseTimer();
    updateCoords();
    setOpen(true);
  };

  const hideSoon = () => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  const toggle = () => {
    clearCloseTimer();
    if (open) {
      setOpen(false);
      return;
    }
    updateCoords();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => updateCoords();
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (bandRef.current?.contains(t) || tipRef.current?.contains(t)) return;
      setOpen(false);
    };
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, updateCoords]);

  useEffect(() => () => clearCloseTimer(), []);

  return (
    <>
      <div
        ref={bandRef}
        role="button"
        aria-expanded={open}
        aria-label={`${session.formationTitre}, ${enrolled.length} place${enrolled.length !== 1 ? "s" : ""} sur ${session.placesOffertes}, ${fillPct} % remplies`}
        aria-describedby={open ? tipId : undefined}
        onMouseEnter={show}
        onMouseLeave={hideSoon}
        onClick={() => {
          if (
            typeof window !== "undefined" &&
            window.matchMedia("(hover: hover) and (pointer: fine)").matches
          ) {
            return;
          }
          toggle();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
        tabIndex={0}
        className={cn(
          "absolute overflow-hidden text-left text-[10px] font-medium tracking-tight outline-none sm:text-[11px]",
          "cursor-default touch-manipulation focus-visible:ring-2 focus-visible:ring-or/30",
          "dark:!bg-[var(--band-empty-dark)]",
          radiusClass,
          className,
        )}
        style={{
          ...style,
          color: pastel.text,
          backgroundColor: pastel.empty,
          ["--band-empty-dark" as string]: pastel.emptyDark,
          ["--band-fill" as string]: pastel.fill,
          ["--band-fill-dark" as string]: pastel.fillDark,
          ["--band-text-dark" as string]: pastel.textDark,
        }}
      >
        {battery ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 bg-[var(--band-fill)] transition-[width,left] duration-300 ease-out dark:bg-[var(--band-fill-dark)]"
            style={{
              left: `${battery.leftPct}%`,
              width: `${battery.widthPct}%`,
            }}
          />
        ) : null}
        <span className="relative z-10 block truncate px-1.5 leading-6 dark:text-[var(--band-text-dark)] sm:px-2.5 sm:leading-7">
          {session.formationTitre}
        </span>
      </div>

      {open && coords
        ? createPortal(
            <div
              ref={tipRef}
              id={tipId}
              role="tooltip"
              onMouseEnter={show}
              onMouseLeave={hideSoon}
              className="pointer-events-auto fixed z-50 max-h-[min(50vh,20rem)] overflow-y-auto rounded-xl border border-border bg-card p-3 shadow-lg"
              style={{
                top: coords.top,
                left: coords.left,
                width: coords.width,
              }}
            >
              <p className="truncate text-xs font-semibold text-cream">
                {session.formationTitre}
              </p>
              {sessionLabel ? (
                <p className="mt-0.5 text-[11px] leading-snug text-muted-text">
                  {sessionLabel}
                </p>
              ) : null}
              <p className="mt-1.5 text-[11px] text-muted-text">
                {enrolled.length}/{session.placesOffertes} places · {fillPct}&nbsp;%
              </p>
              <div className="mt-2 border-t border-border/70 pt-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-text">
                  Stagiaires inscrits
                  {enrolled.length > 0 ? ` · ${enrolled.length}` : ""}
                </p>
                {enrolled.length === 0 ? (
                  <p className="mt-1.5 text-xs text-muted-text">
                    Aucun inscrit pour le moment.
                  </p>
                ) : (
                  <ul className="mt-1.5 max-h-40 space-y-1 overflow-y-auto">
                    {enrolled.map((t) => (
                      <li key={String(t.id)} className="min-w-0">
                        <p className="truncate text-xs font-medium text-cream">
                          {t.userName || t.userEmail}
                        </p>
                        {t.userName ? (
                          <p className="truncate text-[11px] text-muted-text">
                            {t.userEmail}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

const TRACK_H_MOBILE = 24;
const TRACK_H_DESKTOP = 28;
const TRACK_GAP = 4;

/** Grille calendrier scrollable horizontalement sous sm. */
function CalendarScroll({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-1 overflow-x-auto overscroll-x-contain px-1 pb-1 [-webkit-overflow-scrolling:touch] sm:mx-0 sm:overflow-visible sm:px-0 sm:pb-0">
      <div className="min-w-[34rem] sm:min-w-0">{children}</div>
    </div>
  );
}

export function SessionsCalendar({
  sessions,
  mode,
  cursor,
  onModeChange,
  onCursorChange,
}: SessionsCalendarProps) {
  const today = new Date();

  const goPrev = () => {
    if (mode === "week") {
      onCursorChange(addDays(cursor, -7));
    } else {
      onCursorChange(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
    }
  };

  const goNext = () => {
    if (mode === "week") {
      onCursorChange(addDays(cursor, 7));
    } else {
      onCursorChange(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={goPrev}
            aria-label={mode === "week" ? "Semaine précédente" : "Mois précédent"}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-cream transition-colors hover:bg-noir-tertiary/60 sm:size-9"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label={mode === "week" ? "Semaine suivante" : "Mois suivant"}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-cream transition-colors hover:bg-noir-tertiary/60 sm:size-9"
          >
            <ChevronRight className="size-4" />
          </button>
          <p className="ml-1 min-w-0 flex-1 truncate text-sm font-medium text-cream sm:ml-2 sm:flex-none">
            <span className="sm:hidden">
              {mode === "week"
                ? formatWeekPeriodLabelCompact(cursor)
                : formatMonthPeriodLabel(cursor)}
            </span>
            <span className="hidden sm:inline">
              {mode === "week"
                ? formatWeekPeriodLabel(cursor)
                : formatMonthPeriodLabel(cursor)}
            </span>
          </p>
          <button
            type="button"
            onClick={() => onCursorChange(new Date())}
            className="rounded-lg px-2.5 py-2 text-xs font-medium text-muted-text transition-colors hover:bg-noir-tertiary/60 hover:text-cream sm:ml-2 sm:py-1.5"
          >
            Aujourd&apos;hui
          </button>
        </div>

        <div
          role="tablist"
          aria-label="Mode calendrier"
          className="inline-flex w-full rounded-lg border border-border bg-card p-0.5 sm:w-auto"
        >
          {(
            [
              ["week", "Semaine"],
              ["month", "Mois"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={mode === value}
              onClick={() => onModeChange(value)}
              className={cn(
                "flex-1 rounded-md px-3 py-2.5 text-xs font-medium transition-colors sm:flex-none sm:py-1.5",
                mode === value
                  ? "bg-noir-tertiary text-cream"
                  : "text-muted-text hover:text-cream",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {mode === "week" ? (
        <WeekView sessions={sessions} cursor={cursor} today={today} />
      ) : (
        <MonthView sessions={sessions} cursor={cursor} today={today} />
      )}
    </div>
  );
}

function useTrackHeight(): number {
  const [h, setH] = useState(TRACK_H_DESKTOP);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const sync = () => setH(mq.matches ? TRACK_H_DESKTOP : TRACK_H_MOBILE);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return h;
}

function WeekView({
  sessions,
  cursor,
  today,
}: {
  sessions: AdminSessionGroup[];
  cursor: Date;
  today: Date;
}) {
  const days = weekDays(cursor);
  const weekStart = days[0]!;
  const bands = layoutWeekBands(sessions, weekStart);
  const trackH = useTrackHeight();
  const trackCount = bands.reduce((max, b) => Math.max(max, b.track + 1), 0);
  const lanesHeight = Math.max(trackCount, 1) * (trackH + TRACK_GAP) + 8;

  return (
    <CalendarScroll>
      <div className="overflow-visible rounded-2xl border border-border bg-card">
        <div className="grid grid-cols-7 border-b border-border">
          {days.map((d) => (
            <div
              key={toKey(d)}
              className="border-r border-border px-0.5 py-2 text-center last:border-r-0 sm:px-2 sm:py-3"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-text sm:tracking-[0.14em]">
                <DayHeaderLabel d={d} />
              </p>
              <p
                className={cn(
                  "mx-auto mt-1 text-xs font-medium tabular-nums sm:text-sm",
                  isSameDay(d, today)
                    ? "inline-flex size-6 items-center justify-center rounded-full bg-projector text-cream sm:size-7"
                    : "text-cream",
                )}
              >
                {d.getDate()}
              </p>
            </div>
          ))}
        </div>

        <div className="relative" style={{ minHeight: lanesHeight }}>
          <div className="pointer-events-none absolute inset-0 grid grid-cols-7">
            {days.map((d) => (
              <div
                key={`bg-${toKey(d)}`}
                className="border-r border-border/60 last:border-r-0"
              />
            ))}
          </div>

          <div className="relative px-0.5 py-2 sm:px-1">
            {bands.map((band) => {
              const session = sessionById(sessions, band.sessionId);
              if (!session) return null;
              const left = `${(band.startCol / 7) * 100}%`;
              const width = `${((band.endCol - band.startCol + 1) / 7) * 100}%`;
              const padL = band.continuesBefore ? 0 : 2;
              const padR = band.continuesAfter ? 0 : 2;
              const segmentStart = addDays(weekStart, band.startCol);
              const segmentEnd = addDays(weekStart, band.endCol);
              return (
                <BandChip
                  key={`${band.sessionId}-${band.startCol}-${band.track}`}
                  session={session}
                  continuesBefore={band.continuesBefore}
                  continuesAfter={band.continuesAfter}
                  segmentStart={segmentStart}
                  segmentEnd={segmentEnd}
                  style={{
                    left,
                    width: `calc(${width} - ${padL + padR}px)`,
                    marginLeft: padL,
                    top: band.track * (trackH + TRACK_GAP),
                    height: trackH,
                  }}
                />
              );
            })}
            {bands.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-text">
                Aucune session cette semaine.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </CalendarScroll>
  );
}

function MonthView({
  sessions,
  cursor,
  today,
}: {
  sessions: AdminSessionGroup[];
  cursor: Date;
  today: Date;
}) {
  const cells = monthGrid(cursor);
  const weeks = layoutMonthBands(sessions, cursor);
  const headerDays = weekDays(cursor);
  const trackH = useTrackHeight();

  return (
    <CalendarScroll>
      <div className="overflow-visible rounded-2xl border border-border bg-card">
        <div className="grid grid-cols-7 border-b border-border">
          {headerDays.map((d) => (
            <div
              key={`h-${weekdayShortLabel(d)}`}
              className="border-r border-border px-0.5 py-2 text-center last:border-r-0 sm:px-1 sm:py-2.5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-text sm:tracking-[0.14em]">
                <DayHeaderLabel d={d} />
              </p>
            </div>
          ))}
        </div>

        <div className="divide-y divide-border">
          {weeks.map((week) => {
            const weekCells = cells.slice(
              week.weekIndex * 7,
              week.weekIndex * 7 + 7,
            );
            const trackCount = week.bands.reduce(
              (max, b) => Math.max(max, b.track + 1),
              0,
            );
            const lanesHeight =
              Math.max(trackCount, 1) * (trackH + TRACK_GAP) + 4;
            const rowMinHeight = 28 + lanesHeight + 6;

            return (
              <div
                key={week.weekIndex}
                className="relative"
                style={{ minHeight: rowMinHeight }}
              >
                <div className="grid grid-cols-7">
                  {weekCells.map((d) => {
                    const inMonth = isSameMonth(d, cursor);
                    return (
                      <div
                        key={toKey(d)}
                        className={cn(
                          "border-r border-border/60 px-0.5 pt-1 last:border-r-0 sm:px-1.5 sm:pt-1.5",
                          !inMonth && "bg-noir-tertiary/20",
                        )}
                        style={{ minHeight: rowMinHeight }}
                      >
                        <span
                          className={cn(
                            "inline-flex size-5 items-center justify-center text-[11px] tabular-nums sm:size-6 sm:text-xs",
                            isSameDay(d, today)
                              ? "rounded-full bg-projector font-medium text-cream"
                              : inMonth
                                ? "text-cream"
                                : "text-muted-text/50",
                          )}
                        >
                          {d.getDate()}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div
                  className="pointer-events-none absolute inset-x-0 top-6 sm:top-8"
                  style={{ height: lanesHeight }}
                >
                  <div className="pointer-events-auto relative h-full px-0.5">
                    {week.bands.map((band) => {
                      const session = sessionById(sessions, band.sessionId);
                      if (!session) return null;
                      const left = `${(band.startCol / 7) * 100}%`;
                      const width = `${((band.endCol - band.startCol + 1) / 7) * 100}%`;
                      const padL = band.continuesBefore ? 0 : 2;
                      const padR = band.continuesAfter ? 0 : 2;
                      const segmentStart = addDays(week.weekStart, band.startCol);
                      const segmentEnd = addDays(week.weekStart, band.endCol);
                      return (
                        <BandChip
                          key={`${week.weekIndex}-${band.sessionId}-${band.startCol}`}
                          session={session}
                          continuesBefore={band.continuesBefore}
                          continuesAfter={band.continuesAfter}
                          segmentStart={segmentStart}
                          segmentEnd={segmentEnd}
                          style={{
                            left,
                            width: `calc(${width} - ${padL + padR}px)`,
                            marginLeft: padL,
                            top: band.track * (trackH + TRACK_GAP),
                            height: trackH - 2,
                            lineHeight: `${trackH - 2}px`,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </CalendarScroll>
  );
}

function toKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
