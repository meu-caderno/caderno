import type {
  Activity,
  Record as AttendanceRecord,
  Backup,
  Context,
  Edge,
  Id,
  LibraryItem,
  Mood,
  Node,
  OpLogEntry,
  Profile,
  Subject,
  Timestamp,
} from "../domain";
import { EntityName, OpKind } from "../domain";
import { makeOp } from "./oplog";

export enum MergeStrategy {
  UPSERT = "UPSERT",
  REPLACE = "REPLACE",
}

export interface Collections {
  contexts: Context[];
  subjects: Subject[];
  records: AttendanceRecord[];
  activities: Activity[];
  nodes: Node[];
  edges: Edge[];
  library: LibraryItem[];
  profiles: Profile[];
  moods: Mood[];
}

export interface MergeResult {
  store: Collections;
  ops: OpLogEntry[];
}

export function indexById<T extends { id: Id }>(
  items: readonly T[],
): Map<Id, T> {
  return new Map(items.map((item) => [item.id, item]));
}

function sameValue(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function mergeCollection<T extends { id: Id }>(
  entity: EntityName,
  current: readonly T[],
  incoming: readonly T[],
  ts: Timestamp,
  strategy: MergeStrategy = MergeStrategy.UPSERT,
): { merged: T[]; ops: OpLogEntry[] } {
  const merged = indexById(current);
  const incomingIds = new Set(incoming.map((item) => item.id));
  const ops: OpLogEntry[] = [];

  for (const item of incoming) {
    const existing = merged.get(item.id);
    if (!existing || !sameValue(existing, item)) {
      merged.set(item.id, item);
      ops.push(makeOp(entity, OpKind.PUT, item.id, ts));
    }
  }

  if (strategy === MergeStrategy.REPLACE) {
    for (const item of current) {
      if (!incomingIds.has(item.id)) {
        merged.delete(item.id);
        ops.push(makeOp(entity, OpKind.DELETE, item.id, ts));
      }
    }
  }

  return { merged: [...merged.values()], ops };
}

const MERGE_TARGETS: ReadonlyArray<[keyof Collections, EntityName]> = [
  ["contexts", EntityName.CONTEXT],
  ["subjects", EntityName.SUBJECT],
  ["records", EntityName.RECORD],
  ["activities", EntityName.ACTIVITY],
  ["nodes", EntityName.NODE],
  ["edges", EntityName.EDGE],
  ["library", EntityName.LIBRARY],
  ["profiles", EntityName.PROFILE],
  ["moods", EntityName.MOOD],
];

export function mergeBackup(
  store: Collections,
  backup: Backup,
  ts: Timestamp,
  strategy: MergeStrategy = MergeStrategy.UPSERT,
): MergeResult {
  const merged: Collections = {
    contexts: [],
    subjects: [],
    records: [],
    activities: [],
    nodes: [],
    edges: [],
    library: [],
    profiles: [],
    moods: [],
  };
  const ops: OpLogEntry[] = [];

  for (const [key, entity] of MERGE_TARGETS) {
    const current = store[key] as ReadonlyArray<{ id: Id }>;
    const incoming = (backup[key] ?? []) as ReadonlyArray<{ id: Id }>;
    const result = mergeCollection(entity, current, incoming, ts, strategy);
    (merged as unknown as Record<string, { id: Id }[]>)[key] = result.merged;
    ops.push(...result.ops);
  }

  return { store: merged, ops };
}
