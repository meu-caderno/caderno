import { describe, expect, it } from "vitest";
import type { DayIso, Id, Record, Subject } from "../domain";
import { AttendanceStatus } from "../domain";
import {
  AttendanceRiskLevel,
  absencesUntilFloor,
  absenceWeight,
  aggregateAttendance,
  attendanceRisk,
  computeAttendance,
  projectFrequency,
  simulateAbsences,
} from "./attendance";

function records(statuses: AttendanceStatus[]): Record[] {
  return statuses.map((status, i) => ({
    id: `r${i}` as Id,
    subjectId: "subj" as Id,
    day: `2026-03-${String((i % 28) + 1).padStart(2, "0")}` as DayIso,
    status,
  }));
}

const baseSubject: Pick<
  Subject,
  | "hoursPerClass"
  | "classesPerSession"
  | "totalClassHours"
  | "credits"
  | "floor"
  | "records"
> = {
  hoursPerClass: 1,
  classesPerSession: 2,
  credits: 4,
};

describe("absenceWeight", () => {
  it("counts a full absence, half for late, zero otherwise", () => {
    expect(absenceWeight(AttendanceStatus.ABSENT)).toBe(1);
    expect(absenceWeight(AttendanceStatus.LATE)).toBe(0.5);
    expect(absenceWeight(AttendanceStatus.PRESENT)).toBe(0);
    expect(absenceWeight(AttendanceStatus.MEDICAL)).toBe(0);
    expect(absenceWeight(AttendanceStatus.HOLIDAY)).toBe(0);
  });

  it("respects per-subject rules", () => {
    expect(absenceWeight(AttendanceStatus.LATE, { lateIsHalf: false })).toBe(0);
    expect(
      absenceWeight(AttendanceStatus.MEDICAL, { medicalExcuses: false }),
    ).toBe(1);
    expect(
      absenceWeight(AttendanceStatus.WAIVED, { medicalExcuses: false }),
    ).toBe(1);
  });
});

describe("computeAttendance", () => {
  it("derives the budget from credits, session weight and floor", () => {
    const s = computeAttendance(baseSubject, { floor: 0.75 });
    expect(s.totalClassHours).toBe(60);
    expect(s.sessionHours).toBe(2);
    expect(s.maxAbsences).toBe(7);
  });

  it("spends absences (late = half) and computes frequency over held sessions", () => {
    const subject = {
      ...baseSubject,
      records: records([
        ...Array<AttendanceStatus>(10).fill(AttendanceStatus.PRESENT),
        AttendanceStatus.ABSENT,
        AttendanceStatus.ABSENT,
        AttendanceStatus.LATE,
      ]),
    };
    const s = computeAttendance(subject, { floor: 0.75 });
    expect(s.held).toBe(13);
    expect(s.absencesUsed).toBe(2.5);
    expect(s.remaining).toBe(4.5);
    expect(s.frequencyPct).toBe(81);
    expect(s.counts[AttendanceStatus.PRESENT]).toBe(10);
    expect(s.counts[AttendanceStatus.ABSENT]).toBe(2);
    expect(s.counts[AttendanceStatus.LATE]).toBe(1);
  });

  it("excludes holiday/canceled from held sessions", () => {
    const subject = {
      ...baseSubject,
      records: records([
        AttendanceStatus.PRESENT,
        AttendanceStatus.HOLIDAY,
        AttendanceStatus.CANCELED,
        AttendanceStatus.PRESENT,
      ]),
    };
    const s = computeAttendance(subject);
    expect(s.held).toBe(2);
    expect(s.frequencyPct).toBe(100);
    expect(s.meetsFloor).toBe(true);
  });

  it("subject floor overrides the context floor", () => {
    const s = computeAttendance(
      { ...baseSubject, floor: 0.5 },
      { floor: 0.75 },
    );
    expect(s.floor).toBe(0.5);
    expect(s.maxAbsences).toBe(15);
  });

  it("treats an empty history as 100% and full budget", () => {
    const s = computeAttendance(baseSubject);
    expect(s.frequencyPct).toBe(100);
    expect(s.absencesUsed).toBe(0);
    expect(s.remaining).toBe(7);
  });
});

describe("meetsFloor uses the exact ratio", () => {
  it("does not let the rounded percentage mask a sub-floor frequency", () => {
    const recs = [
      ...Array<AttendanceStatus>(149).fill(AttendanceStatus.PRESENT),
      ...Array<AttendanceStatus>(51).fill(AttendanceStatus.ABSENT),
    ];
    const s = computeAttendance(
      {
        hoursPerClass: 1,
        classesPerSession: 1,
        credits: 20,
        records: records(recs),
      },
      { floor: 0.75 },
    );
    expect(s.held).toBe(200);
    expect(s.frequencyPct).toBe(75);
    expect(s.frequency).toBeCloseTo(0.745);
    expect(s.meetsFloor).toBe(false);
  });
});

describe("simulator", () => {
  it("simulateAbsences subtracts from the budget and clamps negatives", () => {
    expect(simulateAbsences({ remaining: 7 }, 2)).toEqual({
      extraAbsences: 2,
      remaining: 5,
      meetsBudget: true,
    });
    expect(simulateAbsences({ remaining: 1 }, 3).meetsBudget).toBe(false);
    expect(simulateAbsences({ remaining: 5 }, -2).extraAbsences).toBe(0);
  });

  it("absencesUntilFloor floors the remaining budget", () => {
    expect(absencesUntilFloor({ remaining: 4.5 })).toBe(4);
    expect(absencesUntilFloor({ remaining: -1 })).toBe(0);
  });

  it("projectFrequency divides over the projected held sessions", () => {
    const p = projectFrequency(
      { held: 10, absencesUsed: 2, floor: 0.75 },
      10,
      3,
    );
    expect(p.projectedFrequencyPct).toBe(75);
    expect(p.meetsFloor).toBe(true);
  });

  it("attendanceRisk classifies safe/warning/over", () => {
    expect(
      attendanceRisk({ remaining: 6, maxAbsences: 8, meetsFloor: true }),
    ).toBe(AttendanceRiskLevel.SAFE);
    expect(
      attendanceRisk({ remaining: 1, maxAbsences: 8, meetsFloor: true }),
    ).toBe(AttendanceRiskLevel.WARNING);
    expect(
      attendanceRisk({ remaining: 0, maxAbsences: 8, meetsFloor: true }),
    ).toBe(AttendanceRiskLevel.OVER);
    expect(
      attendanceRisk({ remaining: 5, maxAbsences: 8, meetsFloor: false }),
    ).toBe(AttendanceRiskLevel.OVER);
  });

  it("aggregateAttendance sums budgets and reports the worst risk", () => {
    const agg = aggregateAttendance(
      [
        { id: "a" as Id, hoursPerClass: 1, classesPerSession: 2, credits: 4 },
        {
          id: "b" as Id,
          hoursPerClass: 1,
          classesPerSession: 2,
          credits: 4,
          records: records([
            ...Array<AttendanceStatus>(10).fill(AttendanceStatus.PRESENT),
            AttendanceStatus.ABSENT,
          ]),
        },
      ],
      { floor: 0.75 },
    );
    expect(agg.perSubject).toHaveLength(2);
    expect(agg.totalMaxAbsences).toBe(14);
    expect(agg.totalRemaining).toBe(13);
    expect(agg.worstRisk).toBe(AttendanceRiskLevel.SAFE);
  });
});
