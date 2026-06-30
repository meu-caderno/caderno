import type { Edge, Id, NotebookNode } from "@meu-caderno/core";
import { Aspect, EdgeKind } from "@meu-caderno/core";
import { describe, expect, it } from "vitest";
import { coverage, prereqsOf, topologicalOrder } from "./study-plan";

const id = (value: string) => value as Id;

function concept(value: string): NotebookNode {
  return { id: id(value), title: value, aspects: [Aspect.CONCEPT] };
}
function prepares(from: string, to: string): Edge {
  return {
    id: id(`${from}-${to}`),
    from: id(from),
    to: id(to),
    kind: EdgeKind.PREPARES,
  };
}

describe("coverage", () => {
  it("computes referenced fraction", () => {
    const result = coverage([id("a"), id("c")], [id("a"), id("b"), id("c")]);
    expect(result).toEqual({ refed: 2, total: 3, pct: 67 });
  });
  it("is 0% when there are no concepts", () => {
    expect(coverage([], [])).toEqual({ refed: 0, total: 0, pct: 0 });
  });
});

describe("prereqsOf", () => {
  it("returns the sources of PREPARES edges pointing at the node", () => {
    const edges = [prepares("a", "b"), prepares("c", "b"), prepares("b", "d")];
    expect(prereqsOf(id("b"), edges)).toEqual([id("a"), id("c")]);
  });
});

describe("topologicalOrder", () => {
  it("places prerequisites before dependents", () => {
    const concepts = [concept("c"), concept("a"), concept("b")];
    const edges = [prepares("a", "b"), prepares("b", "c")];
    expect(topologicalOrder(concepts, edges).map((node) => node.id)).toEqual([
      id("a"),
      id("b"),
      id("c"),
    ]);
  });
  it("falls back to the original order on a cycle", () => {
    const concepts = [concept("a"), concept("b")];
    const edges = [prepares("a", "b"), prepares("b", "a")];
    expect(topologicalOrder(concepts, edges).map((node) => node.id)).toEqual([
      id("a"),
      id("b"),
    ]);
  });
});
