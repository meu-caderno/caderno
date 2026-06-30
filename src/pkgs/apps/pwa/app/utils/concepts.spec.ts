import type { Id, Node } from "@meu-caderno/core";
import { Aspect, Mastery } from "@meu-caderno/core";
import { describe, expect, it } from "vitest";
import { concepts, groupByMastery, nextMastery } from "./concepts";

const id = (value: string) => value as Id;

function node(part: Omit<Partial<Node>, "id"> & { id: string }): Node {
  return {
    id: id(part.id),
    title: part.title ?? part.id,
    aspects: part.aspects ?? [Aspect.NOTE],
    mastery: part.mastery,
  };
}

describe("concepts", () => {
  it("keeps only nodes that include the CONCEPT aspect", () => {
    const nodes = [
      node({ id: "a", aspects: [Aspect.CONCEPT] }),
      node({ id: "b", aspects: [Aspect.NOTE] }),
      node({ id: "c", aspects: [Aspect.TASK, Aspect.CONCEPT] }),
    ];
    expect(concepts(nodes).map((n) => n.id)).toEqual([id("a"), id("c")]);
  });

  it("returns an empty list when no node is a concept", () => {
    expect(concepts([node({ id: "a", aspects: [Aspect.NOTE] })])).toEqual([]);
  });
});

describe("nextMastery", () => {
  it("cycles UNKNOWN to STUDYING to MASTERED to UNKNOWN", () => {
    expect(nextMastery(Mastery.UNKNOWN)).toBe(Mastery.STUDYING);
    expect(nextMastery(Mastery.STUDYING)).toBe(Mastery.MASTERED);
    expect(nextMastery(Mastery.MASTERED)).toBe(Mastery.UNKNOWN);
  });

  it("treats missing mastery as UNKNOWN", () => {
    expect(nextMastery()).toBe(Mastery.STUDYING);
  });
});

describe("groupByMastery", () => {
  it("returns three groups in fixed order", () => {
    const groups = groupByMastery([]);
    expect(groups.map((group) => group.mastery)).toEqual([
      Mastery.UNKNOWN,
      Mastery.STUDYING,
      Mastery.MASTERED,
    ]);
  });

  it("places nodes in their group, defaulting missing mastery to UNKNOWN", () => {
    const nodes = [
      node({ id: "a", aspects: [Aspect.CONCEPT] }),
      node({ id: "b", aspects: [Aspect.CONCEPT], mastery: Mastery.STUDYING }),
      node({ id: "c", aspects: [Aspect.CONCEPT], mastery: Mastery.MASTERED }),
      node({ id: "d", aspects: [Aspect.CONCEPT], mastery: Mastery.STUDYING }),
    ];
    const groups = groupByMastery(nodes);
    expect(groups[0]?.items.map((n) => n.id)).toEqual([id("a")]);
    expect(groups[1]?.items.map((n) => n.id)).toEqual([id("b"), id("d")]);
    expect(groups[2]?.items.map((n) => n.id)).toEqual([id("c")]);
  });
});
