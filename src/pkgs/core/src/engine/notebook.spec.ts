import { describe, expect, it } from "vitest";
import type { Edge, Id, Node } from "../domain";
import { Aspect, EdgeKind } from "../domain";
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
} from "./notebook";

const id = (s: string) => s as Id;
const node = (
  i: string,
  parent?: string,
  aspects: Aspect[] = [Aspect.NOTE],
): Node => ({
  id: id(i),
  aspects,
  title: i,
  parentId: parent ? id(parent) : undefined,
});

const tree = [node("root"), node("a", "root"), node("b", "a"), node("c", "b")];

describe("traversal", () => {
  it("children/ancestors/descendants", () => {
    expect(children(tree, id("root")).map((n) => n.id)).toEqual(["a"]);
    expect(ancestors(tree, id("c")).map((n) => n.id)).toEqual([
      "b",
      "a",
      "root",
    ]);
    expect(
      descendants(tree, id("root"))
        .map((n) => n.id)
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
      reparent(tree, id("a"), id("c")).find((n) => n.id === "a")?.parentId,
    ).toBe("root");
  });
});

describe("orphans / aspects / edges", () => {
  it("deOrphan clears dangling parentId", () => {
    const ns = [node("a", "ghost")];
    expect(orphans(ns).map((n) => n.id)).toEqual(["a"]);
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
