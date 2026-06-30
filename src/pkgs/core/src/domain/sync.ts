import type { OpKind } from "./model";
import type { Id, Timestamp } from "./values";

export type SyncCursor = string & { readonly __brand: "SyncCursor" };

export interface RemoteChange {
  entity: string;
  op: OpKind;
  id: Id;
  ts: Timestamp;
  payload?: unknown;
}

export interface SyncPull {
  changes: readonly RemoteChange[];
  cursor: SyncCursor;
}

export interface SyncState {
  cursor: SyncCursor | null;
  lastSyncedAt?: Timestamp;
}

export interface SyncTransport {
  push(changes: readonly RemoteChange[]): Promise<void>;
  pull(since: SyncCursor | null): Promise<SyncPull>;
}
