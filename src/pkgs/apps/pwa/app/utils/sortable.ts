import type { InjectionKey } from "vue";

export type SortableEdge = "top" | "bottom";

export interface SortablePayload {
  fromId: string;
  toId: string;
  edge: SortableEdge;
}

export interface SortableMovePayload {
  id: string;
  direction: -1 | 1;
}

export interface SortableContext {
  instanceId: symbol;
  emit: (payload: SortablePayload) => void;
  emitMove: (payload: SortableMovePayload) => void;
}

export const SORTABLE_KEY: InjectionKey<SortableContext> =
  Symbol("caderno-sortable");

export function reorderByEdge<T>(
  items: readonly T[],
  fromId: string,
  toId: string,
  edge: SortableEdge,
  keyOf: (item: T) => string,
): T[] {
  if (fromId === toId) return items.slice();
  const fromIndex = items.findIndex((item) => keyOf(item) === fromId);
  if (fromIndex < 0) return items.slice();
  const next = items.slice();
  const [moved] = next.splice(fromIndex, 1);
  if (moved === undefined) return items.slice();
  const targetIndex = next.findIndex((item) => keyOf(item) === toId);
  if (targetIndex < 0) {
    next.splice(fromIndex, 0, moved);
    return next;
  }
  const insertAt = edge === "bottom" ? targetIndex + 1 : targetIndex;
  next.splice(insertAt, 0, moved);
  return next;
}

export function moveByOffset<T>(
  items: readonly T[],
  id: string,
  direction: -1 | 1,
  keyOf: (item: T) => string,
): T[] {
  const fromIndex = items.findIndex((item) => keyOf(item) === id);
  const toIndex = fromIndex + direction;
  if (fromIndex < 0 || toIndex < 0 || toIndex >= items.length) {
    return items.slice();
  }
  const next = items.slice();
  const [moved] = next.splice(fromIndex, 1);
  if (moved === undefined) return items.slice();
  next.splice(toIndex, 0, moved);
  return next;
}
