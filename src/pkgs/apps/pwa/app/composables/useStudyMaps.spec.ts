import type { Id, MapItem, Node } from "@meu-caderno/core";
import { Aspect, MapItemKind } from "@meu-caderno/core";
import { describe, expect, it } from "vitest";
import {
  itemLabel,
  moveItem,
  refItem,
  removeItemAt,
  sectionItem,
} from "./useStudyMaps";

const id = (value: string) => value as Id;

function node(part: { id: string; title: string }): Node {
  return { id: id(part.id), title: part.title, aspects: [Aspect.CONCEPT] };
}

describe("useStudyMaps helpers", () => {
  it("builds section and ref items", () => {
    expect(sectionItem("Intro")).toEqual({
      kind: MapItemKind.SECTION,
      label: "Intro",
    });
    expect(refItem(id("n1"))).toEqual({
      kind: MapItemKind.REF,
      nodeId: id("n1"),
      label: undefined,
    });
  });

  it("moves items within bounds and ignores out-of-range moves", () => {
    const items: MapItem[] = [
      sectionItem("A"),
      sectionItem("B"),
      sectionItem("C"),
    ];
    expect(moveItem(items, 0, 1).map((item) => item.label)).toEqual([
      "B",
      "A",
      "C",
    ]);
    expect(moveItem(items, 0, -1)).toBe(items);
    expect(moveItem(items, 2, 1)).toBe(items);
  });

  it("removes the item at an index", () => {
    const items = [sectionItem("A"), sectionItem("B")];
    expect(removeItemAt(items, 0).map((item) => item.label)).toEqual(["B"]);
    expect(removeItemAt(items, 5)).toBe(items);
  });

  it("labels refs by node title and falls back when missing", () => {
    const nodesById = new Map([
      [id("n1"), node({ id: "n1", title: "Limites" })],
    ]);
    expect(itemLabel(refItem(id("n1")), nodesById)).toBe("Limites");
    expect(itemLabel(refItem(id("gone")), nodesById)).toBe("Conceito removido");
    expect(itemLabel(sectionItem("Cap. 1"), nodesById)).toBe("Cap. 1");
  });
});
