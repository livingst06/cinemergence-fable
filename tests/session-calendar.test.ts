import { describe, expect, it } from "vitest";

import {
  addDays,
  layoutMonthBands,
  layoutWeekBands,
  segmentBatteryFill,
  sessionOccupancyRatio,
  startOfWeekMonday,
  toDayKey,
  weekDays,
} from "@/lib/session-calendar";

describe("toDayKey", () => {
  it("keeps YYYY-MM-DD prefix from ISO strings", () => {
    expect(toDayKey("2026-09-18T00:00:00.000Z")).toBe("2026-09-18");
    expect(toDayKey("2026-09-18")).toBe("2026-09-18");
  });
});

describe("startOfWeekMonday", () => {
  it("returns Monday for a Wednesday", () => {
    // 2026-09-16 = mercredi
    const mon = startOfWeekMonday(new Date(2026, 8, 16));
    expect(toDayKey(mon)).toBe("2026-09-14");
  });

  it("returns Monday for a Sunday", () => {
    const mon = startOfWeekMonday(new Date(2026, 8, 20));
    expect(toDayKey(mon)).toBe("2026-09-14");
  });
});

describe("weekDays", () => {
  it("returns 7 days Mon–Sun", () => {
    const days = weekDays(new Date(2026, 8, 16));
    expect(days).toHaveLength(7);
    expect(toDayKey(days[0]!)).toBe("2026-09-14");
    expect(toDayKey(days[6]!)).toBe("2026-09-20");
  });
});

describe("layoutWeekBands", () => {
  it("clamps a multi-day session into the week and assigns a track", () => {
    const weekStart = new Date(2026, 8, 14); // lun 14 sept
    const bands = layoutWeekBands(
      [
        {
          sessionId: 1,
          dateDebut: "2026-09-15",
          dateFin: "2026-09-18",
        },
      ],
      weekStart,
    );
    expect(bands).toHaveLength(1);
    expect(bands[0]).toMatchObject({
      sessionId: 1,
      startCol: 1,
      endCol: 4,
      track: 0,
      continuesBefore: false,
      continuesAfter: false,
    });
  });

  it("marks broken edges when a session spans week boundaries", () => {
    const weekStart = new Date(2026, 8, 14); // lun 14 sept
    const bands = layoutWeekBands(
      [
        {
          sessionId: 1,
          dateDebut: "2026-09-10",
          dateFin: "2026-09-22",
        },
      ],
      weekStart,
    );
    expect(bands).toHaveLength(1);
    expect(bands[0]).toMatchObject({
      continuesBefore: true,
      continuesAfter: true,
      startCol: 0,
      endCol: 6,
    });
  });

  it("stacks overlapping sessions on different tracks", () => {
    const weekStart = new Date(2026, 8, 14);
    const bands = layoutWeekBands(
      [
        { sessionId: "a", dateDebut: "2026-09-14", dateFin: "2026-09-17" },
        { sessionId: "b", dateDebut: "2026-09-15", dateFin: "2026-09-18" },
      ],
      weekStart,
    );
    expect(bands).toHaveLength(2);
    const tracks = new Set(bands.map((b) => b.track));
    expect(tracks.size).toBe(2);
  });

  it("ignores sessions outside the week", () => {
    const weekStart = new Date(2026, 8, 14);
    const bands = layoutWeekBands(
      [{ sessionId: 9, dateDebut: "2026-10-01", dateFin: "2026-10-05" }],
      weekStart,
    );
    expect(bands).toHaveLength(0);
  });
});

describe("layoutMonthBands", () => {
  it("splits a long session across week rows", () => {
    const weeks = layoutMonthBands(
      [{ sessionId: 1, dateDebut: "2026-09-14", dateFin: "2026-09-25" }],
      new Date(2026, 8, 1),
    );
    const withBands = weeks.filter((w) => w.bands.length > 0);
    expect(withBands.length).toBeGreaterThanOrEqual(2);
    expect(addDays(weeks[0]!.weekStart, 0).getDay()).toBe(1); // Monday
  });
});

describe("sessionOccupancyRatio", () => {
  it("maps enrolled/capacity to 0–1", () => {
    expect(sessionOccupancyRatio(0, 10)).toBe(0);
    expect(sessionOccupancyRatio(5, 10)).toBe(0.5);
    expect(sessionOccupancyRatio(10, 10)).toBe(1);
    expect(sessionOccupancyRatio(12, 10)).toBe(1);
  });
});

describe("segmentBatteryFill", () => {
  it("fills left-to-right across the whole session timeline", () => {
    const sessionStart = new Date(2026, 8, 14);
    const sessionEnd = new Date(2026, 8, 18);
    const fill = segmentBatteryFill({
      fillRatio: 0.4,
      sessionStart,
      sessionEnd,
      segmentStart: sessionStart,
      segmentEnd: sessionEnd,
    });
    expect(fill).not.toBeNull();
    expect(fill!.leftPct).toBeCloseTo(0);
    expect(fill!.widthPct).toBeCloseTo(40);
  });

  it("continues fill into the next week segment", () => {
    const sessionStart = new Date(2026, 8, 14);
    const sessionEnd = new Date(2026, 8, 25);
    const week2Start = new Date(2026, 8, 21);
    const week2End = new Date(2026, 8, 25);
    expect(
      segmentBatteryFill({
        fillRatio: 0.5,
        sessionStart,
        sessionEnd,
        segmentStart: week2Start,
        segmentEnd: week2End,
      }),
    ).toBeNull();
    const fillHigh = segmentBatteryFill({
      fillRatio: 0.75,
      sessionStart,
      sessionEnd,
      segmentStart: week2Start,
      segmentEnd: week2End,
    });
    expect(fillHigh).not.toBeNull();
    expect(fillHigh!.leftPct).toBeCloseTo(0);
    expect(fillHigh!.widthPct).toBeCloseTo(40);
  });
});
