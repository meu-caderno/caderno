import { describe, expect, it } from "vitest";
import type { DayIso } from "../domain";
import { ScheduleKind } from "../domain";
import { addDays, daysBetween, expandSchedule, weekdayOf } from "./schedule";

const asDay = (value: string) => value as DayIso;
const range = (from: string, to: string) => ({
  from: asDay(from),
  to: asDay(to),
});

describe("expandSchedule — weekly", () => {
  it("emits the configured weekdays within the range", () => {
    const days = expandSchedule(
      { kind: ScheduleKind.WEEKLY, weekdays: [1, 3] },
      range("2026-02-09", "2026-02-15"),
    );
    expect(days).toEqual(["2026-02-09", "2026-02-11"]);
  });

  it("returns nothing for an inverted range", () => {
    expect(
      expandSchedule(
        { kind: ScheduleKind.WEEKLY, weekdays: [1] },
        range("2026-02-15", "2026-02-09"),
      ),
    ).toEqual([]);
  });
});

describe("expandSchedule — abWeeks", () => {
  it("only emits A weeks (even week offset from the anchor)", () => {
    const days = expandSchedule(
      {
        kind: ScheduleKind.AB_WEEKS,
        weekdays: [1],
        anchor: asDay("2026-02-09"),
      },
      range("2026-02-09", "2026-03-09"),
    );
    expect(days).toEqual(["2026-02-09", "2026-02-23", "2026-03-09"]);
  });
});

describe("expandSchedule — adHoc", () => {
  it("includes only ad-hoc dates inside the range", () => {
    const days = expandSchedule(
      {
        kind: ScheduleKind.AD_HOC,
        adHocDates: [asDay("2026-02-10"), asDay("2026-03-01")],
      },
      range("2026-02-01", "2026-02-28"),
    );
    expect(days).toEqual(["2026-02-10"]);
  });
});

describe("date helpers", () => {
  it("daysBetween counts whole days", () => {
    expect(daysBetween(asDay("2026-02-09"), asDay("2026-02-12"))).toBe(3);
  });

  it("weekdayOf is timezone-stable (UTC)", () => {
    expect(weekdayOf(asDay("2026-02-09"))).toBe(1);
  });

  it("addDays is reversible", () => {
    expect(addDays(asDay("2026-02-09"), 3)).toBe("2026-02-12");
    expect(addDays(addDays(asDay("2026-02-09"), 5), -5)).toBe("2026-02-09");
  });
});
