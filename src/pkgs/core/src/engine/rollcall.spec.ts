import { describe, expect, it } from "vitest";
import type { DayIso, Id } from "../domain";
import { AttendanceStatus, ScheduleKind } from "../domain";
import { effectiveLoad, nextOccurrences, sessionsOn } from "./rollcall";

const asDay = (value: string) => value as DayIso;
const id = (value: string) => value as Id;

describe("sessionsOn", () => {
  it("returns subjects scheduled on that day with their blocks", () => {
    const subjects = [
      {
        id: id("a"),
        schedule: {
          kind: ScheduleKind.WEEKLY,
          weekdays: [1, 3],
          blocks: [{ start: "08:00", end: "09:40" }],
        },
      },
      { id: id("b"), schedule: { kind: ScheduleKind.WEEKLY, weekdays: [2] } },
    ];
    const wed = sessionsOn(subjects, asDay("2026-02-11"));
    expect(wed).toHaveLength(1);
    expect(wed[0]?.subjectId).toBe("a");
    expect(wed[0]?.blocks).toHaveLength(1);
  });

  it("ignores subjects without a schedule", () => {
    expect(sessionsOn([{ id: id("x") }], asDay("2026-02-11"))).toEqual([]);
  });
});

describe("nextOccurrences", () => {
  it("returns the next N occurrences", () => {
    const occ = nextOccurrences(
      { kind: ScheduleKind.WEEKLY, weekdays: [1] },
      asDay("2026-02-09"),
      3,
    );
    expect(occ).toEqual(["2026-02-09", "2026-02-16", "2026-02-23"]);
  });

  it("returns empty for count <= 0", () => {
    expect(
      nextOccurrences(
        { kind: ScheduleKind.WEEKLY, weekdays: [1] },
        asDay("2026-02-09"),
        0,
      ),
    ).toEqual([]);
  });
});

describe("effectiveLoad", () => {
  it("subtracts holiday/canceled on scheduled days", () => {
    const load = effectiveLoad(
      [
        {
          id: id("a"),
          schedule: { kind: ScheduleKind.WEEKLY, weekdays: [1] },
          records: [
            {
              id: id("r"),
              subjectId: id("a"),
              day: asDay("2026-02-09"),
              status: AttendanceStatus.CANCELED,
            },
          ],
        },
      ],
      { from: asDay("2026-02-09"), to: asDay("2026-02-23") },
    );
    expect(load[0]?.scheduled).toBe(3);
    expect(load[0]?.canceled).toBe(1);
    expect(load[0]?.effective).toBe(2);
  });
});
