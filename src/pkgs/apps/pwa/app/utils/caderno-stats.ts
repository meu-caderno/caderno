import type { AttendanceSummary, Subject } from "@meu-caderno/core";
import {
  AttendanceRiskLevel,
  AttendanceStatus,
  attendanceRisk,
  computeAttendance,
  weightedAverage,
} from "@meu-caderno/core";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export const UNSET_DAY = "1970-01-01";

export function formatDay(isoStr: string): string {
  return format(parseISO(isoStr), "EEE, d MMM", { locale: ptBR });
}
export function daysFromToday(isoStr: string, today: string): number {
  return differenceInCalendarDays(parseISO(isoStr), parseISO(today));
}

export interface StatusSpec {
  key: "ok" | "atencao" | "perigo";
  label: string;
  color: string;
  soft: string;
}
const STATUS_BY_RISK: Record<AttendanceRiskLevel, StatusSpec> = {
  [AttendanceRiskLevel.SAFE]: {
    key: "ok",
    label: "tranquilo",
    color: "#2f7d4f",
    soft: "#e3efe4",
  },
  [AttendanceRiskLevel.WARNING]: {
    key: "atencao",
    label: "atenção",
    color: "#b8862b",
    soft: "#fbf1d8",
  },
  [AttendanceRiskLevel.OVER]: {
    key: "perigo",
    label: "risco",
    color: "#c0392b",
    soft: "#f8e3df",
  },
};

function statusFromSummary(summary: AttendanceSummary): StatusSpec {
  return STATUS_BY_RISK[attendanceRisk(summary)];
}

const HEAT_BY_STATUS: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: "presente",
  [AttendanceStatus.ABSENT]: "falta",
  [AttendanceStatus.LATE]: "atraso",
  [AttendanceStatus.MEDICAL]: "atestado",
  [AttendanceStatus.WAIVED]: "atestado",
  [AttendanceStatus.HOLIDAY]: "none",
  [AttendanceStatus.CANCELED]: "none",
};

export interface SubjectCounts {
  present: number;
  absent: number;
  late: number;
  medical: number;
}

export interface SubjectStats {
  subject: Subject;
  summary: AttendanceSummary;
  status: StatusSpec;
  totalHours: number;
  maxFaltas: number;
  faltasUsadas: number;
  restantes: number;
  freqPct: number;
  floor: number;
  counts: SubjectCounts;
  heat: string[];
  media: number | null;
}

export function deriveStats(
  subject: Subject,
  contextFloor?: number,
): SubjectStats {
  const summary = computeAttendance(subject, { floor: contextFloor });
  const heat = (subject.records ?? [])
    .slice(-24)
    .map((record) => HEAT_BY_STATUS[record.status]);
  return {
    subject,
    summary,
    status: statusFromSummary(summary),
    totalHours: summary.totalClassHours,
    maxFaltas: summary.maxAbsences,
    faltasUsadas: summary.absencesUsed,
    restantes: summary.remaining,
    freqPct: summary.frequencyPct,
    floor: summary.floor,
    counts: {
      present: summary.counts[AttendanceStatus.PRESENT],
      absent: summary.counts[AttendanceStatus.ABSENT],
      late: summary.counts[AttendanceStatus.LATE],
      medical: summary.counts[AttendanceStatus.MEDICAL],
    },
    heat,
    media: weightedAverage(subject.assessments ?? []),
  };
}

export interface TodayClass {
  subject: Subject;
  stats: SubjectStats;
  block?: string;
  marked: AttendanceStatus | null;
}
