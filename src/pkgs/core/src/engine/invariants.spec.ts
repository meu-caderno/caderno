import { describe, expect, it } from "vitest";
import type { Assessment, DayIso, Id, Term } from "../domain";
import { createsCycle, overlappingTerms, weightsBalanced } from "./invariants";

const assessment = (weight: number, id: string): Assessment => ({
  id: id as Id,
  subjectId: "s" as Id,
  name: id,
  weight,
});

const term = (id: string, start?: string, end?: string): Term => ({
  id: id as Id,
  label: id,
  start: start as DayIso | undefined,
  end: end as DayIso | undefined,
});

describe("weightsBalanced", () => {
  it("is true for an empty set and for weights summing to 1", () => {
    expect(weightsBalanced([])).toBe(true);
    expect(weightsBalanced([assessment(0.3, "a"), assessment(0.7, "b")])).toBe(
      true,
    );
  });

  it("is false when weights do not sum to 1", () => {
    expect(weightsBalanced([assessment(0.3, "a"), assessment(0.3, "b")])).toBe(
      false,
    );
  });
});

describe("overlappingTerms", () => {
  it("ignores terms without both dates and finds real overlaps", () => {
    expect(overlappingTerms([term("t", "2026-01-01")])).toHaveLength(0);
    const pairs = overlappingTerms([
      term("a", "2026-01-01", "2026-06-30"),
      term("b", "2026-06-01", "2026-12-31"),
      term("c", "2027-01-01", "2027-06-30"),
    ]);
    expect(pairs).toHaveLength(1);
    expect(pairs[0]?.map((term) => term.id)).toEqual(["a", "b"]);
  });
});

describe("createsCycle", () => {
  const edge = (from: string, to: string) => ({
    from: from as Id,
    to: to as Id,
  });

  it("detects self-links and closing edges", () => {
    expect(createsCycle([], "a" as Id, "a" as Id)).toBe(true);
    expect(createsCycle([edge("a", "b")], "b" as Id, "a" as Id)).toBe(true);
  });

  it("allows a new edge that keeps the graph acyclic", () => {
    expect(createsCycle([edge("a", "b")], "b" as Id, "c" as Id)).toBe(false);
  });
});
