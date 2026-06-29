import type {
  Record as AttendanceRecord,
  DayIso,
  Id,
  Schedule,
  Subject,
  TimeBlock,
} from "../domain";
import { AttendanceStatus } from "../domain";
import { addDays, type DateRange, expandSchedule } from "./schedule";

export interface Session {
  subjectId: Id;
  day: DayIso;
  blocks: TimeBlock[];
}

export function sessionsOn(
  subjects: ReadonlyArray<Pick<Subject, "id" | "schedule">>,
  day: DayIso,
): Session[] {
  return subjects
    .filter(
      (subject) =>
        subject.schedule != null &&
        expandSchedule(subject.schedule, { from: day, to: day }).length > 0,
    )
    .map((subject) => ({
      subjectId: subject.id,
      day,
      blocks: subject.schedule?.blocks ?? [],
    }));
}

export function nextOccurrences(
  schedule: Schedule,
  from: DayIso,
  count: number,
  horizonDays = 366,
): DayIso[] {
  if (count <= 0) return [];
  const days = expandSchedule(schedule, {
    from,
    to: addDays(from, horizonDays),
  });
  return days.slice(0, count);
}

export interface SessionLoad {
  subjectId: Id;
  scheduled: number;
  canceled: number;
  effective: number;
}

const REDUCES: ReadonlySet<AttendanceStatus> = new Set([
  AttendanceStatus.HOLIDAY,
  AttendanceStatus.CANCELED,
]);

export function effectiveLoad(
  subjects: ReadonlyArray<Pick<Subject, "id" | "schedule" | "records">>,
  range: DateRange,
): SessionLoad[] {
  return subjects.map((subject) => {
    const scheduledDays = subject.schedule
      ? new Set<string>(expandSchedule(subject.schedule, range))
      : new Set<string>();
    const records: AttendanceRecord[] = subject.records ?? [];
    const canceled = records.filter(
      (record) => REDUCES.has(record.status) && scheduledDays.has(record.day),
    ).length;
    const scheduled = scheduledDays.size;
    return {
      subjectId: subject.id,
      scheduled,
      canceled,
      effective: Math.max(0, scheduled - canceled),
    };
  });
}
