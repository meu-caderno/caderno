import { RRule } from "rrule";
import type { Activity, DayIso, Id } from "../domain";
import { type ActivityKind, ActivityStatus, Recurrence, Root } from "../domain";
import type { DateRange } from "./schedule";
import { addDays, daysBetween } from "./schedule";

function toDate(day: DayIso): Date {
  return new Date(`${day}T00:00:00Z`);
}
function toDayIso(date: Date): DayIso {
  return date.toISOString().slice(0, 10) as DayIso;
}

export function derivePrepDueDate(
  targetDueDate: DayIso,
  gapDays: number,
): DayIso {
  return addDays(targetDueDate, -gapDays);
}

export function expandRecurrence(
  activity: Activity,
  range: DateRange,
  makeId: (index: number) => Id,
): Activity[] {
  if (
    !activity.recurrence ||
    activity.recurrence === Recurrence.NONE ||
    !activity.dueDate
  ) {
    return [activity];
  }
  const seriesId = activity.seriesId ?? activity.id;
  const anchor = activity.dueDate;
  const rule = new RRule({
    freq: RRule.WEEKLY,
    interval: activity.recurrence === Recurrence.BIWEEKLY ? 2 : 1,
    dtstart: toDate(anchor),
    until: toDate(range.to),
  });
  const out = rule
    .between(toDate(range.from), toDate(range.to), true)
    .map((date, index) => {
      const dueDate = toDayIso(date);
      if (dueDate === anchor) return { ...activity, seriesId };
      return {
        ...activity,
        id: makeId(index),
        dueDate,
        seriesId,
        status: ActivityStatus.OPEN,
        subtasks: activity.subtasks?.map((subtask) => ({
          ...subtask,
          done: false,
        })),
      };
    });
  return out.length > 0 ? out : [{ ...activity, seriesId }];
}

export function nextRecurrence(
  activity: Activity,
  nextId: Id,
): Activity | null {
  if (
    !activity.recurrence ||
    activity.recurrence === Recurrence.NONE ||
    !activity.dueDate
  ) {
    return null;
  }
  const interval = activity.recurrence === Recurrence.BIWEEKLY ? 14 : 7;
  return {
    ...activity,
    id: nextId,
    dueDate: addDays(activity.dueDate, interval),
    seriesId: activity.seriesId ?? activity.id,
    status: ActivityStatus.OPEN,
    subtasks: activity.subtasks?.map((subtask) => ({
      ...subtask,
      done: false,
    })),
  };
}

export function syncPreparesLinks(
  activities: ReadonlyArray<Activity>,
): Activity[] {
  const byId = new Map(activities.map((activity) => [activity.id, activity]));
  return activities.map((activity) => {
    if (!activity.preparesId || activity.gapDays === undefined) return activity;
    const target = byId.get(activity.preparesId);
    if (!target) return activity;
    if (!target.dueDate) return { ...activity, dueDate: undefined };
    return {
      ...activity,
      dueDate: derivePrepDueDate(target.dueDate, activity.gapDays),
    };
  });
}

export function inboxItems(activities: ReadonlyArray<Activity>): Activity[] {
  return activities.filter((activity) => activity.root === Root.INBOX);
}

export function triage(
  activity: Activity,
  patch: { contextId?: Id; subjectId?: Id; kind: ActivityKind },
): Activity {
  return {
    ...activity,
    root: Root.CONTEXT,
    contextId: patch.contextId,
    subjectId: patch.subjectId,
    kind: patch.kind,
  };
}

export enum DueBucket {
  OVERDUE = "OVERDUE",
  TODAY = "TODAY",
  SOON = "SOON",
  LATER = "LATER",
  NONE = "NONE",
}

export function dueBucket(
  activity: Pick<Activity, "dueDate" | "status">,
  today: DayIso,
  soonDays = 3,
): DueBucket {
  if (
    activity.status === ActivityStatus.DONE ||
    activity.status === ActivityStatus.ARCHIVED ||
    !activity.dueDate
  ) {
    return DueBucket.NONE;
  }
  const delta = daysBetween(today, activity.dueDate);
  if (delta < 0) return DueBucket.OVERDUE;
  if (delta === 0) return DueBucket.TODAY;
  if (delta <= soonDays) return DueBucket.SOON;
  return DueBucket.LATER;
}

export function groupByDue(
  activities: ReadonlyArray<Activity>,
  today: DayIso,
  soonDays?: number,
): Record<DueBucket, Activity[]> {
  const groups: Record<DueBucket, Activity[]> = {
    [DueBucket.OVERDUE]: [],
    [DueBucket.TODAY]: [],
    [DueBucket.SOON]: [],
    [DueBucket.LATER]: [],
    [DueBucket.NONE]: [],
  };
  for (const activity of activities)
    groups[dueBucket(activity, today, soonDays)].push(activity);
  return groups;
}

export function sortByDue(activities: ReadonlyArray<Activity>): Activity[] {
  return activities.slice().sort((left, right) => {
    if (!left.dueDate) return 1;
    if (!right.dueDate) return -1;
    return left.dueDate.localeCompare(right.dueDate);
  });
}
