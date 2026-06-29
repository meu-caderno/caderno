import type { InjectionKey } from "vue";

export type SortableEdge = "top" | "bottom";

export interface SortablePayload {
  fromId: string;
  toId: string;
  edge: SortableEdge;
}

export interface SortableContext {
  instanceId: symbol;
  emit: (payload: SortablePayload) => void;
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
