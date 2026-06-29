import { describe, expect, it } from "vitest";
import type { Activity, DayIso, Id } from "../domain";
import { ActivityKind, ActivityStatus, Root, ScheduleKind } from "../domain";
import {
  selectAtRiskSubjects,
  selectInbox,
  selectTodayAgenda,
} from "./selectors";

const d = (s: string) => s as DayIso;
const id = (s: string) => s as Id;

describe("selectors", () => {
  it("selectTodayAgenda lists scheduled subjects", () => {
    expect(
      selectTodayAgenda(
        [
          {
            id: id("a"),
            schedule: { kind: ScheduleKind.WEEKLY, weekdays: [1] },
          },
        ],
        d("2026-02-09"),
      ),
    ).toHaveLength(1);
  });

  it("selectInbox filters inbox items", () => {
    const a: Activity = {
      id: id("x"),
      title: "t",
      kind: ActivityKind.CAPTURE,
      status: ActivityStatus.OPEN,
      root: Root.INBOX,
    };
    expect(selectInbox([a])).toHaveLength(1);
  });

  it("selectAtRiskSubjects drops safe subjects", () => {
    expect(
      selectAtRiskSubjects(
        [{ id: id("a"), hoursPerClass: 1, classesPerSession: 2, credits: 4 }],
        { floor: 0.75 },
      ),
    ).toHaveLength(0);
  });
});
