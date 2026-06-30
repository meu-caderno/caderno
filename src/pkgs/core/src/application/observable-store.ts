import type {
  ContextStore,
  ContextTx,
  EntityCollection,
  Identified,
  Repository,
} from "../domain";

export type EntityKey = EntityCollection;
export type StoreChange = ReadonlySet<EntityKey>;
export type ChangeListener = (changed: StoreChange) => void;

export interface ObservableContextStore extends ContextStore {
  subscribe(listener: ChangeListener): () => void;
}

function recordingRepo<T extends Identified>(
  inner: Repository<T>,
  key: EntityKey,
  touched: Set<EntityKey>,
): Repository<T> {
  return {
    get: (id) => inner.get(id),
    list: () => inner.list(),
    where: (predicate) => inner.where(predicate),
    put: (entity) => {
      touched.add(key);
      return inner.put(entity);
    },
    delete: (id) => {
      touched.add(key);
      return inner.delete(id);
    },
  };
}

function recordingTx(tx: ContextTx, touched: Set<EntityKey>): ContextTx {
  return {
    contexts: recordingRepo(tx.contexts, "contexts", touched),
    subjects: recordingRepo(tx.subjects, "subjects", touched),
    records: recordingRepo(tx.records, "records", touched),
    activities: recordingRepo(tx.activities, "activities", touched),
    library: recordingRepo(tx.library, "library", touched),
    graph: {
      nodes: recordingRepo(tx.graph.nodes, "nodes", touched),
      edges: recordingRepo(tx.graph.edges, "edges", touched),
      childrenOf: (parentId) => tx.graph.childrenOf(parentId),
      edgesFrom: (from) => tx.graph.edgesFrom(from),
      edgesTo: (to) => tx.graph.edgesTo(to),
    },
    oplog: tx.oplog,
  };
}

export function createObservableStore(
  inner: ContextStore,
): ObservableContextStore {
  const listeners = new Set<ChangeListener>();

  const emit = (changed: Set<EntityKey>) => {
    if (changed.size === 0) return;
    for (const listener of listeners) listener(changed);
  };

  const topRepo = <T extends Identified>(
    innerRepo: Repository<T>,
    key: EntityKey,
  ): Repository<T> => ({
    get: (id) => innerRepo.get(id),
    list: () => innerRepo.list(),
    where: (predicate) => innerRepo.where(predicate),
    put: async (entity) => {
      await innerRepo.put(entity);
      emit(new Set([key]));
    },
    delete: async (id) => {
      await innerRepo.delete(id);
      emit(new Set([key]));
    },
  });

  return {
    contexts: topRepo(inner.contexts, "contexts"),
    subjects: topRepo(inner.subjects, "subjects"),
    records: topRepo(inner.records, "records"),
    activities: topRepo(inner.activities, "activities"),
    library: topRepo(inner.library, "library"),
    graph: {
      nodes: topRepo(inner.graph.nodes, "nodes"),
      edges: topRepo(inner.graph.edges, "edges"),
      childrenOf: (parentId) => inner.graph.childrenOf(parentId),
      edgesFrom: (from) => inner.graph.edgesFrom(from),
      edgesTo: (to) => inner.graph.edgesTo(to),
    },
    oplog: inner.oplog,
    transaction: async (work) => {
      const touched = new Set<EntityKey>();
      const result = await inner.transaction((tx) =>
        work(recordingTx(tx, touched)),
      );
      emit(touched);
      return result;
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
