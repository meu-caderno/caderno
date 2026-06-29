import { describe, expect, it } from "vitest";
import type { Bucket, DayIso, Id, Term } from "../domain";
import {
  activeTerm,
  classHoursToCredits,
  creditsToClassHours,
  degreeProgress,
  isInTerm,
  termProgress,
  termRange,
} from "./progress";

const asDay = (value: string) => value as DayIso;
const id = (value: string) => value as Id;
const bucket = (done: number, goal: number): Bucket => ({
  id: id("b"),
  name: "x",
  done,
  goal,
});

describe("credits", () => {
  it("converts credits and class-hours", () => {
    expect(creditsToClassHours(4)).toBe(60);
    expect(classHoursToCredits(30)).toBe(2);
  });
});

describe("degreeProgress", () => {
  it("clamps ratio and treats goal 0 as complete", () => {
    const progress = degreeProgress([bucket(30, 240), bucket(2, 0)]);
    expect(progress.buckets[0]?.ratio).toBeCloseTo(0.125);
    expect(progress.buckets[1]?.ratio).toBe(1);
    expect(progress.buckets[1]?.complete).toBe(true);
  });
});

describe("term", () => {
  const term: Term = {
    id: id("t"),
    label: "2026.1",
    start: asDay("2026-02-09"),
    end: asDay("2026-07-04"),
  };

  it("range and membership", () => {
    expect(termRange(term)).toEqual({ from: "2026-02-09", to: "2026-07-04" });
    expect(isInTerm(term, asDay("2026-03-01"))).toBe(true);
    expect(isInTerm(term, asDay("2026-01-01"))).toBe(false);
    expect(termRange({ id: id("t"), label: "x" })).toBeNull();
  });

  it("activeTerm and progress", () => {
    expect(activeTerm([term], asDay("2026-03-01"))?.label).toBe("2026.1");
    expect(termProgress(term, asDay("2026-02-09"))).toBe(0);
    expect(termProgress(term, asDay("2026-07-04"))).toBe(1);
    expect(termProgress(term, asDay("2026-04-22"))).toBeGreaterThan(0.4);
  });
});
