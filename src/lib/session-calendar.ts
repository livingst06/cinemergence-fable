/** Helpers calendrier sessions (semaine lundi–dimanche, mois). */

export type DayKey = string; // YYYY-MM-DD

export function toDayKey(input: string | Date): DayKey {
  if (typeof input === "string") {
    const m = input.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
    const d = new Date(input);
    if (!Number.isNaN(d.getTime())) {
      return formatLocalDayKey(d);
    }
  } else {
    return formatLocalDayKey(input);
  }
  return formatLocalDayKey(new Date());
}

function formatLocalDayKey(d: Date): DayKey {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

export function parseDayKey(key: DayKey): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() + n);
  return x;
}

export function startOfWeekMonday(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = x.getDay(); // 0 = dimanche
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  return x;
}

export function weekDays(cursor: Date): Date[] {
  const start = startOfWeekMonday(cursor);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** 42 cellules (6 semaines) à partir du lundi de la semaine du 1er du mois. */
export function monthGrid(cursor: Date): Date[] {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const start = startOfWeekMonday(first);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export type SessionDateRange = {
  sessionId: number | string;
  dateDebut: string;
  dateFin: string;
};

export type CalendarBand = {
  sessionId: number | string;
  /** Colonne 0–6 (lundi–dimanche). */
  startCol: number;
  /** Colonne inclusive 0–6. */
  endCol: number;
  /** Piste verticale (empilement). */
  track: number;
  /** La session a commencé avant ce segment (bord gauche non arrondi). */
  continuesBefore: boolean;
  /** La session continue après ce segment (bord droit non arrondi). */
  continuesAfter: boolean;
};

/**
 * Place les sessions qui chevauchent une semaine sur des pistes non chevauchantes.
 */
export function layoutWeekBands(
  sessions: SessionDateRange[],
  weekStart: Date,
): CalendarBand[] {
  const weekEnd = addDays(weekStart, 6);
  const items: Array<{
    sessionId: number | string;
    startCol: number;
    endCol: number;
    continuesBefore: boolean;
    continuesAfter: boolean;
  }> = [];

  for (const s of sessions) {
    const start = parseDayKey(toDayKey(s.dateDebut));
    const end = parseDayKey(toDayKey(s.dateFin));
    if (end < weekStart || start > weekEnd) continue;
    const clampedStart = start < weekStart ? weekStart : start;
    const clampedEnd = end > weekEnd ? weekEnd : end;
    const startCol = Math.round(
      (clampedStart.getTime() - weekStart.getTime()) / 86_400_000,
    );
    const endCol = Math.round(
      (clampedEnd.getTime() - weekStart.getTime()) / 86_400_000,
    );
    items.push({
      sessionId: s.sessionId,
      startCol: Math.max(0, Math.min(6, startCol)),
      endCol: Math.max(0, Math.min(6, endCol)),
      continuesBefore: start < weekStart,
      continuesAfter: end > weekEnd,
    });
  }

  items.sort(
    (a, b) =>
      a.startCol - b.startCol || b.endCol - b.startCol - (a.endCol - a.startCol),
  );

  const trackEnds: number[] = [];
  return items.map((item) => {
    let track = trackEnds.findIndex((end) => end < item.startCol);
    if (track === -1) {
      track = trackEnds.length;
      trackEnds.push(item.endCol);
    } else {
      trackEnds[track] = item.endCol;
    }
    return { ...item, track };
  });
}

export type MonthWeekBands = {
  weekStart: Date;
  weekIndex: number;
  bands: CalendarBand[];
};

/** Découpe les sessions en segments par ligne de semaine du mois. */
export function layoutMonthBands(
  sessions: SessionDateRange[],
  monthCursor: Date,
): MonthWeekBands[] {
  const grid = monthGrid(monthCursor);
  const weeks: MonthWeekBands[] = [];
  for (let w = 0; w < 6; w++) {
    const weekStart = grid[w * 7]!;
    weeks.push({
      weekStart,
      weekIndex: w,
      bands: layoutWeekBands(sessions, weekStart),
    });
  }
  return weeks;
}

const WEEKDAY_SHORT = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"] as const;
const WEEKDAY_LETTER = ["L", "M", "M", "J", "V", "S", "D"] as const;

export function weekdayShortLabel(d: Date): string {
  const day = d.getDay();
  const idx = day === 0 ? 6 : day - 1;
  return WEEKDAY_SHORT[idx]!;
}

/** Initiale FR pour en-têtes très étroits (mobile). */
export function weekdayLetterLabel(d: Date): string {
  const day = d.getDay();
  const idx = day === 0 ? 6 : day - 1;
  return WEEKDAY_LETTER[idx]!;
}

/** Libellé compact : « 10–16 août » (sans année si année courante possible côté UI). */
export function formatWeekPeriodLabelCompact(cursor: Date): string {
  const days = weekDays(cursor);
  const start = days[0]!;
  const end = days[6]!;
  const sameMonth = start.getMonth() === end.getMonth();
  if (sameMonth) {
    return `${start.getDate()}–${end.getDate()} ${start.toLocaleDateString("fr-FR", { month: "short" }).replace(/\.$/, "")}`;
  }
  return `${start.getDate()} ${start.toLocaleDateString("fr-FR", { month: "short" }).replace(/\.$/, "")} – ${end.getDate()} ${end.toLocaleDateString("fr-FR", { month: "short" }).replace(/\.$/, "")}`;
}

export function formatWeekPeriodLabel(cursor: Date): string {
  const days = weekDays(cursor);
  const start = days[0]!;
  const end = days[6]!;
  const sameMonth = start.getMonth() === end.getMonth();
  const sameYear = start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    return `${start.getDate()}–${end.getDate()} ${start.toLocaleDateString("fr-FR", { month: "long" })} ${start.getFullYear()}`;
  }
  if (sameYear) {
    return `${start.getDate()} ${start.toLocaleDateString("fr-FR", { month: "short" }).replace(/\.$/, "")} – ${end.getDate()} ${end.toLocaleDateString("fr-FR", { month: "short" }).replace(/\.$/, "")} ${start.getFullYear()}`;
  }
  return `${start.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })} – ${end.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`;
}

export function formatMonthPeriodLabel(cursor: Date): string {
  const raw = cursor.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

/** Palette pastel : fond vide (jauge) + remplissage + texte. */
export const SESSION_PASTELS = [
  {
    empty: "rgba(221, 212, 200, 0.35)",
    fill: "rgba(201, 184, 164, 0.92)",
    text: "#3f3832",
    emptyDark: "rgba(92, 83, 74, 0.28)",
    fillDark: "rgba(140, 124, 108, 0.85)",
    textDark: "#f0ebe4",
  },
  {
    empty: "rgba(212, 221, 214, 0.35)",
    fill: "rgba(168, 186, 172, 0.92)",
    text: "#354038",
    emptyDark: "rgba(74, 86, 78, 0.28)",
    fillDark: "rgba(110, 130, 116, 0.85)",
    textDark: "#e8efe9",
  },
  {
    empty: "rgba(217, 210, 218, 0.35)",
    fill: "rgba(186, 170, 190, 0.92)",
    text: "#3a343c",
    emptyDark: "rgba(84, 74, 86, 0.28)",
    fillDark: "rgba(130, 114, 134, 0.85)",
    textDark: "#efe8f0",
  },
  {
    empty: "rgba(214, 218, 224, 0.35)",
    fill: "rgba(170, 180, 196, 0.92)",
    text: "#343840",
    emptyDark: "rgba(74, 80, 88, 0.28)",
    fillDark: "rgba(112, 122, 138, 0.85)",
    textDark: "#e8ecf2",
  },
  {
    empty: "rgba(221, 216, 208, 0.35)",
    fill: "rgba(198, 186, 168, 0.92)",
    text: "#403a34",
    emptyDark: "rgba(86, 78, 70, 0.28)",
    fillDark: "rgba(138, 124, 108, 0.85)",
    textDark: "#f2ebe4",
  },
  {
    empty: "rgba(216, 221, 212, 0.35)",
    fill: "rgba(176, 190, 168, 0.92)",
    text: "#383e36",
    emptyDark: "rgba(78, 86, 74, 0.28)",
    fillDark: "rgba(118, 134, 112, 0.85)",
    textDark: "#ecf0e8",
  },
] as const;

export type SessionPastel = (typeof SESSION_PASTELS)[number];

function hashId(id: number | string): number {
  const s = String(id);
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function pastelForId(id: number | string): SessionPastel {
  return SESSION_PASTELS[hashId(id) % SESSION_PASTELS.length]!;
}

/** @deprecated Preférer pastelForId pour la jauge. */
export function pastelClassForId(id: number | string): string {
  const i = hashId(id) % SESSION_PASTELS.length;
  const legacy = [
    "bg-[#ddd4c8]/80 text-[#3f3832] dark:bg-[#5c534a]/45 dark:text-[#f0ebe4]",
    "bg-[#d4ddd6]/80 text-[#354038] dark:bg-[#4a564e]/45 dark:text-[#e8efe9]",
    "bg-[#d9d2da]/80 text-[#3a343c] dark:bg-[#544a56]/45 dark:text-[#efe8f0]",
    "bg-[#d6dae0]/80 text-[#343840] dark:bg-[#4a5058]/45 dark:text-[#e8ecf2]",
    "bg-[#ddd8d0]/80 text-[#403a34] dark:bg-[#564e46]/45 dark:text-[#f2ebe4]",
    "bg-[#d8ddd4]/80 text-[#383e36] dark:bg-[#4e564a]/45 dark:text-[#ecf0e8]",
  ] as const;
  return legacy[i]!;
}

/** 0 = aucune place achetée, 1 = session pleine (capacité atteinte ou dépassée). */
export function sessionOccupancyRatio(
  enrolledCount: number,
  placesOffertes: number,
): number {
  if (placesOffertes <= 0) return enrolledCount > 0 ? 1 : 0;
  return Math.min(1, Math.max(0, enrolledCount / placesOffertes));
}

/** True si la capacité est atteinte ou dépassée (places restantes = 0). */
export function isSessionFull(
  enrolledCount: number,
  placesOffertes: number,
): boolean {
  return placesOffertes > 0 && enrolledCount >= placesOffertes;
}

/**
 * Portion de jauge visible dans un segment (continuité gauche→droite sur toute la session).
 * Retourne left/width en % du segment, ou null si rien à peindre.
 */
export function segmentBatteryFill(args: {
  fillRatio: number;
  sessionStart: Date;
  sessionEnd: Date;
  segmentStart: Date;
  segmentEnd: Date;
}): { leftPct: number; widthPct: number } | null {
  const { fillRatio, sessionStart, sessionEnd, segmentStart, segmentEnd } =
    args;
  if (fillRatio <= 0) return null;

  const dayMs = 86_400_000;
  const sessionStartMs = sessionStart.getTime();
  const sessionEndExclusive = sessionEnd.getTime() + dayMs;
  const totalMs = sessionEndExclusive - sessionStartMs;
  if (totalMs <= 0) return null;

  const filledEndMs = sessionStartMs + fillRatio * totalMs;
  const segStartMs = segmentStart.getTime();
  const segEndExclusive = segmentEnd.getTime() + dayMs;
  const segLen = segEndExclusive - segStartMs;
  if (segLen <= 0) return null;

  const overlapStart = Math.max(segStartMs, sessionStartMs);
  const overlapEnd = Math.min(segEndExclusive, filledEndMs);
  if (overlapEnd <= overlapStart) return null;

  return {
    leftPct: ((overlapStart - segStartMs) / segLen) * 100,
    widthPct: ((overlapEnd - overlapStart) / segLen) * 100,
  };
}
