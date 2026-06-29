import type { Id } from "../domain";
import { OpKind } from "../domain";

export interface Reversible<T extends { id: Id }> {
  entity: string;
  id: Id;
  before?: T;
  after?: T;
}

export interface UndoState<T extends { id: Id }> {
  past: Reversible<T>[];
  future: Reversible<T>[];
}

export interface InverseOp<T> {
  op: OpKind;
  entity: string;
  id: Id;
  value?: T;
}

export function emptyUndo<T extends { id: Id }>(): UndoState<T> {
  return { past: [], future: [] };
}

export function recordChange<T extends { id: Id }>(
  state: UndoState<T>,
  change: Reversible<T>,
): UndoState<T> {
  return { past: [...state.past, change], future: [] };
}

export function invert<T extends { id: Id }>(
  change: Reversible<T>,
): InverseOp<T> {
  if (change.before === undefined) {
    return { op: OpKind.DELETE, entity: change.entity, id: change.id };
  }
  return {
    op: OpKind.PUT,
    entity: change.entity,
    id: change.id,
    value: change.before,
  };
}

function forward<T extends { id: Id }>(change: Reversible<T>): InverseOp<T> {
  if (change.after === undefined) {
    return { op: OpKind.DELETE, entity: change.entity, id: change.id };
  }
  return {
    op: OpKind.PUT,
    entity: change.entity,
    id: change.id,
    value: change.after,
  };
}

export function undo<T extends { id: Id }>(
  state: UndoState<T>,
): { state: UndoState<T>; apply?: InverseOp<T> } {
  const last = state.past.at(-1);
  if (!last) return { state };
  return {
    state: { past: state.past.slice(0, -1), future: [...state.future, last] },
    apply: invert(last),
  };
}

export function redo<T extends { id: Id }>(
  state: UndoState<T>,
): { state: UndoState<T>; apply?: InverseOp<T> } {
  const next = state.future.at(-1);
  if (!next) return { state };
  return {
    state: { past: [...state.past, next], future: state.future.slice(0, -1) },
    apply: forward(next),
  };
}
