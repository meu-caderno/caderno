import type {
  Activity,
  AttendanceRecord,
  Backup,
  Context,
  Edge,
  LibraryItem,
  Mood,
  NotebookNode,
  Profile,
  Subject,
  Timestamp,
} from "@meu-caderno/core";
import { BackupSchema, BackupV1Schema } from "./schemas";

export interface BackupCollections {
  contexts: Context[];
  subjects: Subject[];
  records: AttendanceRecord[];
  activities: Activity[];
  nodes: NotebookNode[];
  edges: Edge[];
  library: LibraryItem[];
  profiles?: Profile[];
  moods?: Mood[];
}

export interface Migration {
  from: number;
  to: number;
  up(data: unknown): unknown;
}

export const migrations: Migration[] = [
  {
    from: 1,
    to: 2,
    up(data) {
      const v1 = BackupV1Schema.parse(data);
      return { ...v1, version: 2 };
    },
  },
];

export function exportBackup(
  collections: BackupCollections,
  exportedAt: Timestamp,
): Backup {
  return BackupSchema.parse({
    version: 2,
    exportedAt,
    contexts: collections.contexts,
    subjects: collections.subjects,
    records: collections.records,
    activities: collections.activities,
    nodes: collections.nodes,
    edges: collections.edges,
    library: collections.library,
    profiles: collections.profiles,
    moods: collections.moods,
  });
}

export function parseBackup(data: unknown): Backup {
  return BackupSchema.parse(data);
}

export function safeParseBackup(data: unknown) {
  return BackupSchema.safeParse(data);
}

interface VersionedPayload {
  version?: number;
}

function versionOf(data: unknown): number | undefined {
  if (typeof data !== "object" || data === null) return undefined;
  return (data as VersionedPayload).version;
}

export function migrateBackup(data: unknown): Backup {
  let current = data;
  for (const migration of migrations) {
    if (versionOf(current) === migration.from) {
      current = migration.up(current);
    }
  }
  return BackupSchema.parse(current);
}
