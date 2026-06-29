import { describe, expect, it } from "vitest";
import { neededGrade, weightedAverage } from "./grades";

const assessments = [
  { weight: 0.3, grade: 5 },
  { weight: 0.3, grade: 7 },
  { weight: 0.4 },
];

describe("weightedAverage", () => {
  it("averages only graded assessments by weight", () => {
    expect(weightedAverage(assessments)).toBeCloseTo(6);
  });

  it("returns null when nothing is graded", () => {
    expect(weightedAverage([{ weight: 1 }])).toBeNull();
  });
});

describe("neededGrade", () => {
  it("solves for the grade needed on the remaining weight", () => {
    const result = neededGrade(assessments, 6);
    expect(result).not.toBeNull();
    expect(result?.needed).toBeCloseTo(6);
    expect(result?.remainingWeight).toBeCloseTo(0.4);
    expect(result?.secured).toBe(false);
    expect(result?.impossible).toBe(false);
  });

  it("flags an already-secured target", () => {
    const result = neededGrade(
      [{ weight: 0.5, grade: 10 }, { weight: 0.5 }],
      4,
    );
    expect(result?.secured).toBe(true);
  });

  it("flags an impossible target", () => {
    const result = neededGrade([{ weight: 0.5, grade: 2 }, { weight: 0.5 }], 9);
    expect(result?.impossible).toBe(true);
  });

  it("returns null when there is nothing left to grade", () => {
    expect(neededGrade([{ weight: 1, grade: 8 }], 6)).toBeNull();
  });
});

describe("consistency under Σweights = 1", () => {
  it("neededGrade solves the implied final over the full weighting", () => {
    const result = neededGrade([{ weight: 0.5, grade: 6 }, { weight: 0.5 }], 7);
    expect(result?.needed).toBeCloseTo(8);
    expect(result?.remainingWeight).toBeCloseTo(0.5);
  });
});
