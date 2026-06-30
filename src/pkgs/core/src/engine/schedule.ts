import type { DayIso, Schedule } from "../domain";
import { ScheduleKind } from "../domain";

const MS_PER_DAY = 86_400_000;
const MS_PER_WEEK = MS_PER_DAY * 7;

function toUtc(day: DayIso): number {
  const [year, month, dayOfMonth] = day.split("-").map(Number);
  return Date.UTC(year ?? 1970, (month ?? 1) - 1, dayOfMonth ?? 1);
}

function fromUtc(milliseconds: number): DayIso {
  const date = new Date(milliseconds);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}` as DayIso;
}

export function daysBetween(from: DayIso, to: DayIso): number {
  return Math.round((toUtc(to) - toUtc(from)) / MS_PER_DAY);
}

export function addDays(day: DayIso, days: number): DayIso {
  return fromUtc(toUtc(day) + days * MS_PER_DAY);
}

export function weekdayOf(day: DayIso): number {
  return new Date(toUtc(day)).getUTCDay();
}

export interface DateRange {
  from: DayIso;
  to: DayIso;
}

function isRecurringDay(
  schedule: Schedule,
  weekdays: ReadonlySet<number>,
  anchorMilliseconds: number,
  milliseconds: number,
): boolean {
  if (!weekdays.has(new Date(milliseconds).getUTCDay())) return false;
  if (schedule.kind === ScheduleKind.AB_WEEKS) {
    const weeksFromAnchor = Math.floor(
      (milliseconds - anchorMilliseconds) / MS_PER_WEEK,
    );
    return weeksFromAnchor % 2 === 0;
  }
  return true;
}

function recurringDays(
  schedule: Schedule,
  startMilliseconds: number,
  endMilliseconds: number,
): string[] {
  const weekdays = new Set(schedule.weekdays ?? []);
  const recurs =
    (schedule.kind === ScheduleKind.WEEKLY ||
      schedule.kind === ScheduleKind.AB_WEEKS) &&
    weekdays.size > 0;
  if (!recurs) return [];

  const anchorMilliseconds = schedule.anchor
    ? toUtc(schedule.anchor)
    : startMilliseconds;
  const days: string[] = [];
  for (
    let milliseconds = startMilliseconds;
    milliseconds <= endMilliseconds;
    milliseconds += MS_PER_DAY
  ) {
    if (isRecurringDay(schedule, weekdays, anchorMilliseconds, milliseconds)) {
      days.push(fromUtc(milliseconds));
    }
  }
  return days;
}

function adHocDays(
  schedule: Schedule,
  startMilliseconds: number,
  endMilliseconds: number,
): string[] {
  const days: string[] = [];
  for (const adHocDate of schedule.adHocDates ?? []) {
    const milliseconds = toUtc(adHocDate);
    if (milliseconds >= startMilliseconds && milliseconds <= endMilliseconds) {
      days.push(adHocDate);
    }
  }
  return days;
}

export function expandSchedule(schedule: Schedule, range: DateRange): DayIso[] {
  const startMilliseconds = toUtc(range.from);
  const endMilliseconds = toUtc(range.to);
  if (endMilliseconds < startMilliseconds) return [];

  const days = new Set<string>([
    ...recurringDays(schedule, startMilliseconds, endMilliseconds),
    ...adHocDays(schedule, startMilliseconds, endMilliseconds),
  ]);
  return [...days].sort() as DayIso[];
}
