import type {
  Activity,
  Record as AttendanceRecord,
  DayIso,
  Id,
  Subject,
} from "../domain";
import { type DueBucket, groupByDue, inboxItems } from "./activities";
import {
  type AttendanceInput,
  type AttendanceOptions,
  AttendanceRiskLevel,
  aggregateAttendance,
  type SubjectAttendanceRisk,
} from "./attendance";
import { type Session, sessionsOn } from "./rollcall";

export function selectTodayAgenda(
  subjects: ReadonlyArray<Pick<Subject, "id" | "schedule">>,
  today: DayIso,
): Session[] {
  return sessionsOn(subjects, today);
}

export function selectInbox(activities: ReadonlyArray<Activity>): Activity[] {
  return inboxItems(activities);
}

export function recordsOf(
  records: ReadonlyArray<AttendanceRecord>,
  subjectId: Id,
): AttendanceRecord[] {
  return records.filter((record) => record.subjectId === subjectId);
}

export function selectDueBuckets(
  activities: ReadonlyArray<Activity>,
  today: DayIso,
): Record<DueBucket, Activity[]> {
  return groupByDue(activities, today);
}

export function selectAtRiskSubjects(
  subjects: ReadonlyArray<{ id: Id } & AttendanceInput>,
  options: AttendanceOptions = {},
): SubjectAttendanceRisk[] {
  return aggregateAttendance(subjects, options).perSubject.filter(
    (subjectRisk) => subjectRisk.risk !== AttendanceRiskLevel.SAFE,
  );
}
