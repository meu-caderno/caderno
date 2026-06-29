import fc from "fast-check";
import { describe, it } from "vitest";
import type { DayIso, Id, Record } from "../domain";
import { AttendanceStatus } from "../domain";
import { computeAttendance } from "./attendance";
import { weightedAverage } from "./grades";
import { addDays } from "./schedule";

const statusArb = fc.constantFrom(
  ...(Object.values(AttendanceStatus) as AttendanceStatus[]),
);

describe("engine properties", () => {
  it("frequencyPct stays within [0, 100]", () => {
    fc.assert(
      fc.property(fc.array(statusArb), (statuses) => {
        const recs: Record[] = statuses.map((status, i) => ({
          id: `r${i}` as Id,
          subjectId: "s" as Id,
          day: "2026-01-01" as DayIso,
          status,
        }));
        const summary = computeAttendance(
          { hoursPerClass: 1, classesPerSession: 1, credits: 4, records: recs },
          { floor: 0.75 },
        );
        return summary.frequencyPct >= 0 && summary.frequencyPct <= 100;
      }),
    );
  });

  it("addDays is reversible", () => {
    fc.assert(
      fc.property(fc.integer({ min: -3650, max: 3650 }), (offset) => {
        const base = "2026-06-15" as DayIso;
        return addDays(addDays(base, offset), -offset) === base;
      }),
    );
  });

  it("weightedAverage stays within [0, 10]", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            weight: fc.double({ min: 0.01, max: 1, noNaN: true }),
            grade: fc.double({ min: 0, max: 10, noNaN: true }),
          }),
          { minLength: 1 },
        ),
        (assessments) => {
          const avg = weightedAverage(assessments);
          return avg === null || (avg >= -1e-9 && avg <= 10 + 1e-9);
        },
      ),
    );
  });
});
