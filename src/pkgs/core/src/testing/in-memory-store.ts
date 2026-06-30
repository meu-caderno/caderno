import type {
  Activity,
  AttendanceRecord,
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
  NotebookNode,
  OpLogEntry,
  OpLogStore,
  Preferences,
  Profile,
  Repository,
  StorageProvider,
  StudyMap,
  Subject,
  Timestamp,
} from "../domain";
import { CapabilityImpact, OriginKind } from "../domain";
import type { Snapshotable } from "./snapshot";

type MemRepo<T extends Identified> = Repository<T> & Snapshotable;

function createRepo<T extends Identified>(): MemRepo<T> {
  let map = new Map<Id, T>();
  return {
    async get(id) {
      return map.get(id);
    },
    async list() {
      return [...map.values()];
    },
    async where(predicate) {
      return [...map.values()].filter(predicate);
    },
    async put(entity) {
      map.set(entity.id, entity);
    },
    async delete(id) {
      map.delete(id);
    },
    snapshot() {
      return new Map(map);
    },
    restore(state) {
      map = new Map(state as Map<Id, T>);
    },
  };
}

export function createInMemoryContextStore(): ContextStore {
  const contexts = createRepo<Context>();
  const subjects = createRepo<Subject>();
  const records = createRepo<AttendanceRecord>();
  const activities = createRepo<Activity>();
  const library = createRepo<LibraryItem>();
  const maps = createRepo<StudyMap>();
  const nodes = createRepo<NotebookNode>();
  const edges = createRepo<Edge>();

  const graph: GraphRepository = {
    nodes,
    edges,
    async childrenOf(parentId) {
      return (await nodes.list()).filter((node) => node.parentId === parentId);
    },
    async edgesFrom(from) {
      return (await edges.list()).filter((edge) => edge.from === from);
    },
    async edgesTo(to) {
      return (await edges.list()).filter((edge) => edge.to === to);
    },
  };

  let log: OpLogEntry[] = [];
  const oplog: OpLogStore = {
    async append(entry) {
      log.push(entry);
    },
    async appendMany(entries) {
      log.push(...entries);
    },
    async since(timestamp: Timestamp) {
      return log.filter((entry) => entry.timestamp >= timestamp);
    },
    async forId(id) {
      return log.filter((entry) => entry.id === id);
    },
  };

  const snapshotables: Snapshotable[] = [
    contexts,
    subjects,
    records,
    activities,
    library,
    maps,
    nodes,
    edges,
  ];

  const tx: ContextTx = {
    contexts,
    subjects,
    records,
    activities,
    library,
    maps,
    graph,
    oplog,
  };

  return {
    ...tx,
    async transaction(work) {
      const snaps = snapshotables.map((snapshotable) =>
        snapshotable.snapshot(),
      );
      const logSnap = [...log];
      try {
        return await work(tx);
      } catch (error) {
        snapshotables.forEach((snapshotable, index) => {
          snapshotable.restore(snaps[index]);
        });
        log = [...logSnap];
        throw error;
      }
    },
  };
}

export function createInMemoryConfigStore(): ConfigStore {
  return {
    profiles: createRepo<Profile>(),
    moods: createRepo<Mood>(),
    preferences: createRepo<Preferences>(),
  };
}

export function inMemoryStorageProvider(): StorageProvider {
  return {
    manifest: {
      id: "storage:memory",
      title: "In-memory storage",
      impact: CapabilityImpact.LOW,
      origin: OriginKind.NATIVE,
    },
    createContextStore: async () => createInMemoryContextStore(),
  };
}
