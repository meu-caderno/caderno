import type { Bucket, DayIso, Id, Term } from "../domain";
import { CLASS_HOURS_PER_CREDIT } from "./attendance";
import * as num from "./math";
import { type DateRange, daysBetween } from "./schedule";

export function creditsToClassHours(credits: number): number {
  return num.multiply(credits, CLASS_HOURS_PER_CREDIT);
}

export function classHoursToCredits(hours: number): number {
  return num.divide(hours, CLASS_HOURS_PER_CREDIT);
}

export interface BucketProgress {
  id: Id;
  name: string;
  done: number;
  goal: number;
  ratio: number;
  complete: boolean;
}

export interface DegreeProgress {
  buckets: BucketProgress[];
  totalDone: number;
  totalGoal: number;
  ratio: number;
}

export function degreeProgress(buckets: ReadonlyArray<Bucket>): DegreeProgress {
  const mapped = buckets.map((bucket) => ({
    id: bucket.id,
    name: bucket.name,
    done: bucket.done,
    goal: bucket.goal,
    ratio:
      bucket.goal === 0
        ? 1
        : num.clamp(num.divide(bucket.done, bucket.goal), 0, 1),
    complete: bucket.done >= bucket.goal,
  }));
  const totalDone = num.sum(buckets.map((bucket) => bucket.done));
  const totalGoal = num.sum(buckets.map((bucket) => bucket.goal));
  return {
    buckets: mapped,
    totalDone,
    totalGoal,
    ratio:
      totalGoal === 0 ? 1 : num.clamp(num.divide(totalDone, totalGoal), 0, 1),
  };
}

export function termRange(term: Term): DateRange | null {
  if (term.start && term.end) return { from: term.start, to: term.end };
  return null;
}

export function isInTerm(term: Term, day: DayIso): boolean {
  if (!term.start && !term.end) return false;
  if (term.start && day < term.start) return false;
  if (term.end && day > term.end) return false;
  return true;
}

export function activeTerm(
  terms: ReadonlyArray<Term>,
  today: DayIso,
): Term | null {
  return terms.find((term) => isInTerm(term, today)) ?? null;
}

export function termProgress(term: Term, today: DayIso): number {
  if (!term.start || !term.end) return 0;
  if (today <= term.start) return 0;
  if (today >= term.end) return 1;
  const total = daysBetween(term.start, term.end);
  if (total <= 0) return 0;
  return num.clamp(num.divide(daysBetween(term.start, today), total), 0, 1);
}
