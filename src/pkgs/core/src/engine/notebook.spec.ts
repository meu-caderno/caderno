import { describe, expect, it } from "vitest";
import type { Edge, Id, NotebookNode } from "../domain";
import { Aspect, EdgeKind, Mastery } from "../domain";
import {
  ancestors,
  canReparent,
  children,
  deOrphan,
  descendants,
  edgesByKind,
  nodesByAspect,
  orphanEdges,
  orphans,
  reparent,
  reviewQueue,
} from "./notebook";

const id = (value: string) => value as Id;
const node = (
  i: string,
  parent?: string,
  aspects: Aspect[] = [Aspect.NOTE],
): NotebookNode => ({
  id: id(i),
  aspects,
  title: i,
  parentId: parent ? id(parent) : undefined,
});

const tree = [node("root"), node("a", "root"), node("b", "a"), node("c", "b")];

describe("traversal", () => {
  it("children/ancestors/descendants", () => {
    expect(children(tree, id("root")).map((node) => node.id)).toEqual(["a"]);
    expect(ancestors(tree, id("c")).map((node) => node.id)).toEqual([
      "b",
      "a",
      "root",
    ]);
    expect(
      descendants(tree, id("root"))
        .map((node) => node.id)
        .sort(),
    ).toEqual(["a", "b", "c"]);
  });

  it("does not hang on a pre-existing cycle", () => {
    const cyclic = [node("x", "y"), node("y", "x")];
    expect(ancestors(cyclic, id("x")).length).toBeLessThanOrEqual(2);
  });
});

describe("reparent", () => {
  it("rejects self and descendant targets", () => {
    expect(canReparent(tree, id("a"), id("c"))).toBe(false);
    expect(canReparent(tree, id("a"), id("a"))).toBe(false);
    expect(canReparent(tree, id("a"), id("root"))).toBe(true);
    expect(
      reparent(tree, id("a"), id("c")).find((node) => node.id === "a")
        ?.parentId,
    ).toBe("root");
  });
});

describe("orphans / aspects / edges", () => {
  it("deOrphan clears dangling parentId", () => {
    const ns = [node("a", "ghost")];
    expect(orphans(ns).map((node) => node.id)).toEqual(["a"]);
    expect(deOrphan(ns)[0]?.parentId).toBeUndefined();
  });

  it("nodesByAspect and orphan edges", () => {
    expect(
      nodesByAspect(
        [node("t", undefined, [Aspect.TASK, Aspect.NOTE])],
        Aspect.TASK,
      ),
    ).toHaveLength(1);
    const edges: Edge[] = [
      { id: id("e"), from: id("a"), to: id("ghost"), kind: EdgeKind.PART_OF },
    ];
    expect(orphanEdges(edges, [node("a")])).toHaveLength(1);
    expect(edgesByKind(edges, EdgeKind.PART_OF)).toHaveLength(1);
  });
});

describe("reviewQueue", () => {
  const concept = (i: string, mastery?: Mastery): NotebookNode => ({
    ...node(i, undefined, [Aspect.CONCEPT]),
    mastery,
  });

  it("keeps only concepts not yet mastered", () => {
    const queue = reviewQueue([
      concept("studying", Mastery.STUDYING),
      concept("mastered", Mastery.MASTERED),
      concept("unknown", Mastery.UNKNOWN),
      node("plain-note", undefined, [Aspect.NOTE]),
      { ...node("note-studying"), mastery: Mastery.STUDYING },
    ]);
    expect(queue.map((n) => n.id)).toEqual(["unknown", "studying"]);
  });

  it("treats missing mastery as UNKNOWN and orders it first", () => {
    const queue = reviewQueue([
      concept("studying", Mastery.STUDYING),
      concept("no-mastery"),
    ]);
    expect(queue.map((n) => n.id)).toEqual(["no-mastery", "studying"]);
  });

  it("orders UNKNOWN before STUDYING", () => {
    const queue = reviewQueue([
      concept("s1", Mastery.STUDYING),
      concept("u1", Mastery.UNKNOWN),
      concept("s2", Mastery.STUDYING),
      concept("u2", Mastery.UNKNOWN),
    ]);
    expect(queue.map((n) => masteryRank(n.mastery))).toEqual([0, 0, 1, 1]);
  });
});

function masteryRank(mastery?: Mastery): number {
  return mastery === Mastery.STUDYING ? 1 : 0;
}
