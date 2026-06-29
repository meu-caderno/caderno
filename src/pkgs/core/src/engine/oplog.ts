import type { Id, OpKind, OpLogEntry, Timestamp } from "../domain";

export function makeOp(
  entity: string,
  op: OpKind,
  id: Id,
  ts: Timestamp,
): OpLogEntry {
  return { ts, entity, op, id };
}

export function appendOp(
  log: readonly OpLogEntry[],
  entry: OpLogEntry,
): OpLogEntry[] {
  return [...log, entry];
}

export function opsForEntity(
  log: readonly OpLogEntry[],
  entity: string,
): OpLogEntry[] {
  return log.filter((entry) => entry.entity === entity);
}

export function opsForId(log: readonly OpLogEntry[], id: Id): OpLogEntry[] {
  return log.filter((entry) => entry.id === id);
}
