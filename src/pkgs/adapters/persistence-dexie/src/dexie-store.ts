import type {
  Activity,
  Record as AttendanceRecord,
  BlobLog,
  BlobRepository,
  BlobRow,
  BlobStore,
  BlobTx,
  ConfigStore,
  Context,
  ContextStore,
  ContextTx,
  Edge,
  GraphRepository,
  Id,
  Identified,
  LibraryItem,
  Mood,
  Node,
  OpKind,
  OpLogEntry,
  OpLogStore,
  Preferences,
  Profile,
  Repository,
  StorageProvider,
  Subject,
  Timestamp,
} from "@meu-caderno/core";
import { CapabilityImpact, OriginKind } from "@meu-caderno/core";
import Dexie, { type Table } from "dexie";

interface OpLogRow {
  seq?: number;
  ts: number;
  entity: string;
  op: string;
  id: string;
}

function repo<T extends Identified>(table: Table<T, string>): Repository<T> {
  return {
    get: (id) => table.get(id),
    list: () => table.toArray(),
    where: async (predicate) => (await table.toArray()).filter(predicate),
    put: async (entity) => {
      await table.put(entity);
    },
    delete: async (id) => {
      await table.delete(id);
    },
  };
}

function toEntry(row: OpLogRow): OpLogEntry {
  return {
    ts: row.ts as Timestamp,
    entity: row.entity,
    op: row.op as OpKind,
    id: row.id as Id,
  };
}

function toRow(entry: OpLogEntry): OpLogRow {
  return { ts: entry.ts, entity: entry.entity, op: entry.op, id: entry.id };
}

export function createDexieContextStore(name = "caderno"): ContextStore {
  const db = new Dexie(name);
  db.version(1).stores({
    contexts: "id",
    subjects: "id",
    records: "id, subjectId",
    activities: "id, contextId, subjectId",
    library: "id",
    nodes: "id, parentId",
    edges: "id, from, to",
    oplog: "++seq, id, ts",
  });

  const nodesTable = db.table<Node, string>("nodes");
  const edgesTable = db.table<Edge, string>("edges");
  const oplogTable = db.table<OpLogRow, number>("oplog");

  const graph: GraphRepository = {
    nodes: repo(nodesTable),
    edges: repo(edgesTable),
    childrenOf: (parentId) =>
      nodesTable.where("parentId").equals(parentId).toArray(),
    edgesFrom: (from) => edgesTable.where("from").equals(from).toArray(),
    edgesTo: (to) => edgesTable.where("to").equals(to).toArray(),
  };

  const oplog: OpLogStore = {
    append: async (entry) => {
      await oplogTable.add(toRow(entry));
    },
    appendMany: async (entries) => {
      await oplogTable.bulkAdd(entries.map(toRow));
    },
    since: async (timestamp) =>
      (await oplogTable.where("ts").aboveOrEqual(timestamp).toArray()).map(
        toEntry,
      ),
    forId: async (id) =>
      (await oplogTable.where("id").equals(id).toArray()).map(toEntry),
  };

  const tx: ContextTx = {
    contexts: repo(db.table<Context, string>("contexts")),
    subjects: repo(db.table<Subject, string>("subjects")),
    records: repo(db.table<AttendanceRecord, string>("records")),
    activities: repo(db.table<Activity, string>("activities")),
    library: repo(db.table<LibraryItem, string>("library")),
    graph,
    oplog,
  };

  return {
    ...tx,
    transaction: (work) => db.transaction("rw", db.tables, () => work(tx)),
  };
}

export function createDexieConfigStore(name = "caderno-config"): ConfigStore {
  const db = new Dexie(name);
  db.version(1).stores({ profiles: "id", moods: "id", preferences: "id" });
  return {
    profiles: repo(db.table<Profile, string>("profiles")),
    moods: repo(db.table<Mood, string>("moods")),
    preferences: repo(db.table<Preferences, string>("preferences")),
  };
}

interface BlobLogRow {
  seq?: number;
  data: string;
}

function blobRepo(table: Table<BlobRow, string>): BlobRepository {
  return {
    get: (id) => table.get(id),
    list: () => table.toArray(),
    put: (row) => table.put(row).then(() => undefined),
    delete: (id) => table.delete(id),
  };
}

const BLOB_COLLECTIONS = [
  "contexts",
  "subjects",
  "records",
  "activities",
  "library",
  "nodes",
  "edges",
] as const;

type BlobCollection = (typeof BLOB_COLLECTIONS)[number];
type WriteBuffer = Map<string, BlobRow | null>;

export function createDexieBlobStore(name = "caderno-enc"): BlobStore {
  const db = new Dexie(name);
  const stores: Record<string, string> = { oplog: "++seq" };
  for (const collection of BLOB_COLLECTIONS) stores[collection] = "id";
  db.version(1).stores(stores);

  const oplogTable = db.table<BlobLogRow, number>("oplog");
  const table = (collection: string) => db.table<BlobRow, string>(collection);

  const readOplog = () =>
    oplogTable
      .orderBy("seq")
      .toArray()
      .then((rows) => rows.map((row) => row.data));

  const oplog: BlobLog = {
    append: (data) => oplogTable.add({ data }).then(() => undefined),
    appendMany: (entries) =>
      oplogTable
        .bulkAdd(entries.map((data) => ({ data })))
        .then(() => undefined),
    list: readOplog,
  };

  const base = { oplog } as BlobTx;
  for (const collection of BLOB_COLLECTIONS) {
    base[collection] = blobRepo(table(collection));
  }

  const buffered = <R>(work: (tx: BlobTx) => Promise<R>): Promise<R> => {
    const writes = {} as Record<BlobCollection, WriteBuffer>;
    for (const collection of BLOB_COLLECTIONS) writes[collection] = new Map();
    const appended: string[] = [];

    const overlayRepo = (collection: BlobCollection): BlobRepository => {
      const buffer = writes[collection];
      return {
        get: (id) =>
          buffer.has(id)
            ? Promise.resolve(buffer.get(id) ?? undefined)
            : table(collection).get(id),
        list: () =>
          table(collection)
            .toArray()
            .then((rows) => {
              const merged = new Map(rows.map((row) => [row.id, row]));
              for (const [id, row] of buffer) {
                if (row) merged.set(id, row);
                else merged.delete(id);
              }
              return [...merged.values()];
            }),
        put: (row) => {
          buffer.set(row.id, row);
          return Promise.resolve();
        },
        delete: (id) => {
          buffer.set(id, null);
          return Promise.resolve();
        },
      };
    };

    const overlayOplog: BlobLog = {
      append: (data) => {
        appended.push(data);
        return Promise.resolve();
      },
      appendMany: (entries) => {
        appended.push(...entries);
        return Promise.resolve();
      },
      list: () => readOplog().then((existing) => [...existing, ...appended]),
    };
    const overlay = { oplog: overlayOplog } as BlobTx;
    for (const collection of BLOB_COLLECTIONS) {
      overlay[collection] = overlayRepo(collection);
    }

    const flush = () => {
      for (const collection of BLOB_COLLECTIONS) {
        const target = table(collection);
        for (const [id, row] of writes[collection]) {
          if (row) target.put(row);
          else target.delete(id);
        }
      }
      for (const data of appended) oplogTable.add({ data });
    };

    return work(overlay).then((result) =>
      db.transaction("rw", db.tables, flush).then(() => result),
    );
  };

  return { ...base, transaction: buffered };
}

export function dexieStorageProvider(name = "caderno"): StorageProvider {
  return {
    manifest: {
      id: "storage:dexie",
      title: "Dexie (IndexedDB)",
      impact: CapabilityImpact.MEDIUM,
      origin: OriginKind.NATIVE,
    },
    createContextStore: async () => createDexieContextStore(name),
  };
}
