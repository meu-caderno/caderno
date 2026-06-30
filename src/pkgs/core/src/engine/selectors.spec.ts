import { describe, expect, it } from "vitest";
import type { Activity, DayIso, Id } from "../domain";
import { ActivityKind, ActivityStatus, Root, ScheduleKind } from "../domain";
import {
  selectAtRiskSubjects,
  selectInbox,
  selectTodayAgenda,
} from "./selectors";

const asDay = (value: string) => value as DayIso;
const id = (value: string) => value as Id;

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
        asDay("2026-02-09"),
      ),
    ).toHaveLength(1);
  });

  it("selectInbox filters inbox items", () => {
    const activity: Activity = {
      id: id("x"),
      title: "t",
      kind: ActivityKind.CAPTURE,
      status: ActivityStatus.OPEN,
      root: Root.INBOX,
    };
    expect(selectInbox([activity])).toHaveLength(1);
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
