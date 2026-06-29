import type { Record as AttendanceRecord, Id, Subject } from "../domain";
import { AttendanceStatus } from "../domain";
import * as num from "./math";

export const DEFAULT_ATTENDANCE_FLOOR = 0.75;

export const CLASS_HOURS_PER_CREDIT = 15;

const LATE_WEIGHT = 0.5;

const HELD: ReadonlySet<AttendanceStatus> = new Set([
  AttendanceStatus.PRESENT,
  AttendanceStatus.ABSENT,
  AttendanceStatus.LATE,
  AttendanceStatus.MEDICAL,
  AttendanceStatus.WAIVED,
]);

export interface AbsenceRule {
  lateIsHalf?: boolean;
  medicalExcuses?: boolean;
}

export function absenceWeight(
  status: AttendanceStatus,
  rule: AbsenceRule = {},
): number {
  if (status === AttendanceStatus.ABSENT) return 1;
  if (status === AttendanceStatus.LATE) {
    return (rule.lateIsHalf ?? true) ? LATE_WEIGHT : 0;
  }
  if (
    status === AttendanceStatus.MEDICAL ||
    status === AttendanceStatus.WAIVED
  ) {
    return (rule.medicalExcuses ?? true) ? 0 : 1;
  }
  return 0;
}

export type AttendanceCounts = Record<AttendanceStatus, number>;

export type AttendanceInput = Pick<
  Subject,
  | "hoursPerClass"
  | "classesPerSession"
  | "totalClassHours"
  | "credits"
  | "floor"
  | "lateIsHalf"
  | "medicalExcuses"
  | "records"
>;

export interface AttendanceSummary {
  totalClassHours: number;
  sessionHours: number;
  floor: number;
  maxAbsences: number;
  absencesUsed: number;
  remaining: number;
  held: number;
  frequency: number;
  frequencyPct: number;
  meetsFloor: boolean;
  counts: AttendanceCounts;
}

export interface AttendanceOptions {
  floor?: number;
}

function emptyCounts(): AttendanceCounts {
  return {
    [AttendanceStatus.PRESENT]: 0,
    [AttendanceStatus.ABSENT]: 0,
    [AttendanceStatus.LATE]: 0,
    [AttendanceStatus.MEDICAL]: 0,
    [AttendanceStatus.WAIVED]: 0,
    [AttendanceStatus.HOLIDAY]: 0,
    [AttendanceStatus.CANCELED]: 0,
  };
}

export function computeAttendance(
  subject: AttendanceInput,
  options: AttendanceOptions = {},
): AttendanceSummary {
  const totalClassHours =
    subject.totalClassHours ??
    num.multiply(subject.credits ?? 0, CLASS_HOURS_PER_CREDIT);
  const sessionHours = num.multiply(
    subject.hoursPerClass,
    subject.classesPerSession,
  );
  const floor = subject.floor ?? options.floor ?? DEFAULT_ATTENDANCE_FLOOR;

  const maxAbsenceHours = num.multiply(totalClassHours, num.subtract(1, floor));
  const maxAbsences =
    sessionHours > 0 ? num.floor(num.divide(maxAbsenceHours, sessionHours)) : 0;

  const rule: AbsenceRule = {
    lateIsHalf: subject.lateIsHalf,
    medicalExcuses: subject.medicalExcuses,
  };
  const records: AttendanceRecord[] = subject.records ?? [];
  const counts = emptyCounts();
  let held = 0;
  for (const r of records) {
    counts[r.status] += 1;
    if (HELD.has(r.status)) held += 1;
  }
  const absencesUsed = num.sum(
    records.map((r) => absenceWeight(r.status, rule)),
  );

  const remaining = num.subtract(maxAbsences, absencesUsed);
  const frequency =
    held === 0 ? 1 : num.divide(num.subtract(held, absencesUsed), held);

  return {
    totalClassHours,
    sessionHours,
    floor,
    maxAbsences,
    absencesUsed,
    remaining,
    held,
    frequency,
    frequencyPct: num.round(num.multiply(frequency, 100)),
    meetsFloor: frequency >= floor,
    counts,
  };
}

export enum AttendanceRiskLevel {
  SAFE = "SAFE",
  WARNING = "WARNING",
  OVER = "OVER",
}

const RISK_RANK: Record<AttendanceRiskLevel, number> = {
  [AttendanceRiskLevel.SAFE]: 0,
  [AttendanceRiskLevel.WARNING]: 1,
  [AttendanceRiskLevel.OVER]: 2,
};

export interface AbsenceScenario {
  extraAbsences: number;
  remaining: number;
  meetsBudget: boolean;
}

export function simulateAbsences(
  summary: Pick<AttendanceSummary, "remaining">,
  extraAbsences: number,
): AbsenceScenario {
  const extra = Math.max(0, extraAbsences);
  const remaining = num.subtract(summary.remaining, extra);
  return { extraAbsences: extra, remaining, meetsBudget: remaining >= 0 };
}

export function absencesUntilFloor(
  summary: Pick<AttendanceSummary, "remaining">,
): number {
  return Math.max(0, num.floor(summary.remaining));
}

export interface FrequencyProjection {
  projectedFrequency: number;
  projectedFrequencyPct: number;
  meetsFloor: boolean;
}

export function projectFrequency(
  summary: Pick<AttendanceSummary, "held" | "absencesUsed" | "floor">,
  futureHeld: number,
  futureAbsences: number,
): FrequencyProjection {
  const held = num.add(summary.held, Math.max(0, futureHeld));
  const used = num.add(summary.absencesUsed, Math.max(0, futureAbsences));
  const frequency = held === 0 ? 1 : num.divide(num.subtract(held, used), held);
  return {
    projectedFrequency: frequency,
    projectedFrequencyPct: num.round(num.multiply(frequency, 100)),
    meetsFloor: frequency >= summary.floor,
  };
}

export function attendanceRisk(
  summary: Pick<AttendanceSummary, "remaining" | "maxAbsences" | "meetsFloor">,
  warnAt = 0.3,
): AttendanceRiskLevel {
  if (summary.remaining <= 0 || !summary.meetsFloor) {
    return AttendanceRiskLevel.OVER;
  }
  const threshold = Math.max(
    1,
    num.ceil(num.multiply(summary.maxAbsences, warnAt)),
  );
  if (summary.remaining <= threshold) return AttendanceRiskLevel.WARNING;
  return AttendanceRiskLevel.SAFE;
}

export interface SubjectAttendanceRisk {
  subjectId: Id;
  summary: AttendanceSummary;
  risk: AttendanceRiskLevel;
}

export interface AggregateAttendance {
  perSubject: SubjectAttendanceRisk[];
  totalMaxAbsences: number;
  totalAbsencesUsed: number;
  totalRemaining: number;
  worstRisk: AttendanceRiskLevel;
}

export function aggregateAttendance(
  subjects: ReadonlyArray<{ id: Id } & AttendanceInput>,
  options: AttendanceOptions = {},
): AggregateAttendance {
  const perSubject = subjects.map((subject) => {
    const summary = computeAttendance(subject, options);
    return { subjectId: subject.id, summary, risk: attendanceRisk(summary) };
  });
  const worstRisk = perSubject.reduce<AttendanceRiskLevel>(
    (worst, s) => (RISK_RANK[s.risk] > RISK_RANK[worst] ? s.risk : worst),
    AttendanceRiskLevel.SAFE,
  );
  const totalMaxAbsences = num.sum(
    perSubject.map((s) => s.summary.maxAbsences),
  );
  const totalAbsencesUsed = num.sum(
    perSubject.map((s) => s.summary.absencesUsed),
  );
  return {
    perSubject,
    totalMaxAbsences,
    totalAbsencesUsed,
    totalRemaining: num.subtract(totalMaxAbsences, totalAbsencesUsed),
    worstRisk,
  };
}
