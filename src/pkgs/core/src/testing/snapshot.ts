export interface Snapshotable {
  snapshot(): unknown;
  restore(state: unknown): void;
}
