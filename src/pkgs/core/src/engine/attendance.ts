import type { AttendanceRecord, Id, Subject } from "../domain";
import { AttendanceStatus } from "../domain";
import * as numeric from "./math";

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
    numeric.multiply(subject.credits ?? 0, CLASS_HOURS_PER_CREDIT);
  const sessionHours = numeric.multiply(
    subject.hoursPerClass,
    subject.classesPerSession,
  );
  const floor = subject.floor ?? options.floor ?? DEFAULT_ATTENDANCE_FLOOR;

  const maxAbsenceHours = numeric.multiply(
    totalClassHours,
    numeric.subtract(1, floor),
  );
  const maxAbsences =
    sessionHours > 0
      ? numeric.floor(numeric.divide(maxAbsenceHours, sessionHours))
      : 0;

  const rule: AbsenceRule = {
    lateIsHalf: subject.lateIsHalf,
    medicalExcuses: subject.medicalExcuses,
  };
  const records: AttendanceRecord[] = subject.records ?? [];
  const counts = emptyCounts();
  let held = 0;
  for (const record of records) {
    counts[record.status] += 1;
    if (HELD.has(record.status)) held += 1;
  }
  const absencesUsed = numeric.sum(
    records.map((record) => absenceWeight(record.status, rule)),
  );

  const remaining = numeric.subtract(maxAbsences, absencesUsed);
  const frequency =
    held === 0 ? 1 : numeric.divide(numeric.subtract(held, absencesUsed), held);

  return {
    totalClassHours,
    sessionHours,
    floor,
    maxAbsences,
    absencesUsed,
    remaining,
    held,
    frequency,
    frequencyPct: numeric.round(numeric.multiply(frequency, 100)),
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
  const remaining = numeric.subtract(summary.remaining, extra);
  return { extraAbsences: extra, remaining, meetsBudget: remaining >= 0 };
}

export function absencesUntilFloor(
  summary: Pick<AttendanceSummary, "remaining">,
): number {
  return Math.max(0, numeric.floor(summary.remaining));
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
  const held = numeric.add(summary.held, Math.max(0, futureHeld));
  const used = numeric.add(summary.absencesUsed, Math.max(0, futureAbsences));
  const frequency =
    held === 0 ? 1 : numeric.divide(numeric.subtract(held, used), held);
  return {
    projectedFrequency: frequency,
    projectedFrequencyPct: numeric.round(numeric.multiply(frequency, 100)),
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
    numeric.ceil(numeric.multiply(summary.maxAbsences, warnAt)),
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
    (worst, subjectRisk) =>
      RISK_RANK[subjectRisk.risk] > RISK_RANK[worst] ? subjectRisk.risk : worst,
    AttendanceRiskLevel.SAFE,
  );
  const totalMaxAbsences = numeric.sum(
    perSubject.map((subjectRisk) => subjectRisk.summary.maxAbsences),
  );
  const totalAbsencesUsed = numeric.sum(
    perSubject.map((subjectRisk) => subjectRisk.summary.absencesUsed),
  );
  return {
    perSubject,
    totalMaxAbsences,
    totalAbsencesUsed,
    totalRemaining: numeric.subtract(totalMaxAbsences, totalAbsencesUsed),
    worstRisk,
  };
}
