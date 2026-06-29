import type { DayIso, Schedule } from "../domain";
import { ScheduleKind } from "../domain";

const MS_PER_DAY = 86_400_000;
const MS_PER_WEEK = MS_PER_DAY * 7;

function toUtc(day: DayIso): number {
  const [y, m, d] = day.split("-").map(Number);
  return Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

function fromUtc(ms: number): DayIso {
  const dt = new Date(ms);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}` as DayIso;
}

export function daysBetween(a: DayIso, b: DayIso): number {
  return Math.round((toUtc(b) - toUtc(a)) / MS_PER_DAY);
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

export function expandSchedule(schedule: Schedule, range: DateRange): DayIso[] {
  const startMs = toUtc(range.from);
  const endMs = toUtc(range.to);
  if (endMs < startMs) return [];

  const out = new Set<string>();
  const weekdays = new Set(schedule.weekdays ?? []);
  const anchorMs = schedule.anchor ? toUtc(schedule.anchor) : startMs;

  if (
    (schedule.kind === ScheduleKind.WEEKLY ||
      schedule.kind === ScheduleKind.AB_WEEKS) &&
    weekdays.size > 0
  ) {
    for (let ms = startMs; ms <= endMs; ms += MS_PER_DAY) {
      if (!weekdays.has(new Date(ms).getUTCDay())) continue;
      if (schedule.kind === ScheduleKind.AB_WEEKS) {
        const weeksFromAnchor = Math.floor((ms - anchorMs) / MS_PER_WEEK);
        if (weeksFromAnchor % 2 !== 0) continue;
      }
      out.add(fromUtc(ms));
    }
  }

  for (const d of schedule.adHocDates ?? []) {
    const ms = toUtc(d);
    if (ms >= startMs && ms <= endMs) out.add(d);
  }

  return [...out].sort() as DayIso[];
}
