import type { EntityName, Id, OpKind, OpLogEntry, Timestamp } from "../domain";

export function makeOp(
  entity: EntityName,
  op: OpKind,
  id: Id,
  timestamp: Timestamp,
): OpLogEntry {
  return { timestamp, entity, op, id };
}

export function appendOp(
  log: readonly OpLogEntry[],
  entry: OpLogEntry,
): OpLogEntry[] {
  return [...log, entry];
}

export function opsForEntity(
  log: readonly OpLogEntry[],
  entity: EntityName,
): OpLogEntry[] {
  return log.filter((entry) => entry.entity === entity);
}

export function opsForId(log: readonly OpLogEntry[], id: Id): OpLogEntry[] {
  return log.filter((entry) => entry.id === id);
}
