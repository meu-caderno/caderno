import { describe, expect, it } from "vitest";
import {
  exportBackup,
  migrateBackup,
  parseBackup,
  safeParseBackup,
} from "./backup";
import { TimestampSchema } from "./schemas";

const ts = TimestampSchema.parse(1_700_000_000_000);

const empty = {
  contexts: [],
  subjects: [],
  records: [],
  activities: [],
  nodes: [],
  edges: [],
  library: [],
};

describe("exportBackup / parseBackup", () => {
  it("stamps a version-2 envelope and round-trips through JSON", () => {
    const backup = exportBackup(empty, ts);
    expect(backup.version).toBe(2);
    expect(backup.exportedAt).toBe(ts);
    expect(parseBackup(JSON.parse(JSON.stringify(backup)))).toEqual(backup);
  });

  it("rejects an invalid payload", () => {
    expect(safeParseBackup({ version: 2 }).success).toBe(false);
    expect(() => parseBackup({ nope: true })).toThrow();
  });
});

describe("migrateBackup", () => {
  it("promotes a version-1 backup to version 2", () => {
    const migrated = migrateBackup({
      version: 1,
      exportedAt: 1_700_000_000_000,
      ...empty,
    });
    expect(migrated.version).toBe(2);
    expect(migrated.exportedAt).toBe(ts);
  });

  it("passes a valid version-2 backup straight through", () => {
    const v2 = exportBackup(empty, ts);
    expect(migrateBackup(JSON.parse(JSON.stringify(v2))).version).toBe(2);
  });

  it("throws on an unknown version", () => {
    expect(() =>
      migrateBackup({ version: 3, exportedAt: 1, ...empty }),
    ).toThrow();
  });
});
