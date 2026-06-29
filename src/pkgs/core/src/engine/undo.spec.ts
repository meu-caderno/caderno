import { describe, expect, it } from "vitest";
import type { Id } from "../domain";
import { OpKind } from "../domain";
import { emptyUndo, invert, recordChange, redo, undo } from "./undo";

interface Thing {
  id: Id;
  v: number;
}
const id = (s: string) => s as Id;

describe("invert", () => {
  it("inverts a create (no before) into a delete", () => {
    expect(
      invert<Thing>({
        entity: "thing",
        id: id("x"),
        after: { id: id("x"), v: 1 },
      }).op,
    ).toBe(OpKind.DELETE);
  });

  it("inverts an update into a put of the before value", () => {
    const inv = invert<Thing>({
      entity: "thing",
      id: id("x"),
      before: { id: id("x"), v: 1 },
      after: { id: id("x"), v: 2 },
    });
    expect(inv.op).toBe(OpKind.PUT);
    expect(inv.value?.v).toBe(1);
  });
});

describe("undo / redo", () => {
  it("moves changes between past and future", () => {
    let state = emptyUndo<Thing>();
    state = recordChange(state, {
      entity: "thing",
      id: id("x"),
      after: { id: id("x"), v: 1 },
    });
    const undone = undo(state);
    expect(undone.apply?.op).toBe(OpKind.DELETE);
    expect(undone.state.past).toHaveLength(0);
    expect(undone.state.future).toHaveLength(1);

    const redone = redo(undone.state);
    expect(redone.apply?.op).toBe(OpKind.PUT);
    expect(redone.state.past).toHaveLength(1);
  });

  it("recordChange clears the redo branch", () => {
    let state = emptyUndo<Thing>();
    state = recordChange(state, {
      entity: "t",
      id: id("a"),
      after: { id: id("a"), v: 1 },
    });
    state = undo(state).state;
    state = recordChange(state, {
      entity: "t",
      id: id("b"),
      after: { id: id("b"), v: 1 },
    });
    expect(state.future).toHaveLength(0);
  });
});
