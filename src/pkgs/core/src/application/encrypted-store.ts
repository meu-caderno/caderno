import type {
  BlobLog,
  BlobRepository,
  BlobRow,
  BlobStore,
  BlobTx,
  Cipher,
  ContextStore,
  ContextTx,
  Edge,
  GraphRepository,
  Identified,
  Node,
  OpLogEntry,
  OpLogStore,
  Repository,
  StorageProvider,
} from "../domain";
import { CapabilityImpact, OriginKind } from "../domain";

function encryptedRepo<T extends Identified>(
  blob: BlobRepository,
  cipher: Cipher,
): Repository<T> {
  const decode = (row: BlobRow) =>
    cipher.decrypt(row.data).then((json) => JSON.parse(json) as T);
  const encode = (entity: T) =>
    cipher
      .encrypt(JSON.stringify(entity))
      .then((data) => ({ id: entity.id, data }));
  return {
    get: (id) => blob.get(id).then((row) => (row ? decode(row) : undefined)),
    list: () => blob.list().then((rows) => Promise.all(rows.map(decode))),
    where: (predicate) =>
      blob
        .list()
        .then((rows) => Promise.all(rows.map(decode)))
        .then((entities) => entities.filter(predicate)),
    put: (entity) => encode(entity).then((row) => blob.put(row)),
    delete: (id) => blob.delete(id),
  };
}

function encryptedOpLog(blob: BlobLog, cipher: Cipher): OpLogStore {
  const decode = (data: string) =>
    cipher.decrypt(data).then((json) => JSON.parse(json) as OpLogEntry);
  const encode = (entry: OpLogEntry) => cipher.encrypt(JSON.stringify(entry));
  return {
    append: (entry) => encode(entry).then((data) => blob.append(data)),
    appendMany: (entries) =>
      Promise.all(entries.map(encode)).then((data) => blob.appendMany(data)),
    since: (timestamp) =>
      blob
        .list()
        .then((list) => Promise.all(list.map(decode)))
        .then((entries) => entries.filter((entry) => entry.ts >= timestamp)),
    forId: (id) =>
      blob
        .list()
        .then((list) => Promise.all(list.map(decode)))
        .then((entries) => entries.filter((entry) => entry.id === id)),
  };
}

function encryptedTx(blob: BlobTx, cipher: Cipher): ContextTx {
  const nodes = encryptedRepo<Node>(blob.nodes, cipher);
  const edges = encryptedRepo<Edge>(blob.edges, cipher);
  const graph: GraphRepository = {
    nodes,
    edges,
    childrenOf: (parentId) =>
      nodes
        .list()
        .then((all) => all.filter((node) => node.parentId === parentId)),
    edgesFrom: (from) =>
      edges.list().then((all) => all.filter((edge) => edge.from === from)),
    edgesTo: (to) =>
      edges.list().then((all) => all.filter((edge) => edge.to === to)),
  };
  return {
    contexts: encryptedRepo(blob.contexts, cipher),
    subjects: encryptedRepo(blob.subjects, cipher),
    records: encryptedRepo(blob.records, cipher),
    activities: encryptedRepo(blob.activities, cipher),
    library: encryptedRepo(blob.library, cipher),
    graph,
    oplog: encryptedOpLog(blob.oplog, cipher),
  };
}

export function createEncryptedContextStore(
  blob: BlobStore,
  cipher: Cipher,
): ContextStore {
  return {
    ...encryptedTx(blob, cipher),
    transaction: (work) =>
      blob.transaction((tx) => work(encryptedTx(tx, cipher))),
  };
}

export function encryptedStorageProvider(
  createBlobStore: () => BlobStore,
  cipher: Cipher,
): StorageProvider {
  return {
    manifest: {
      id: "storage:encrypted",
      title: "Encrypted storage",
      impact: CapabilityImpact.HIGH,
      origin: OriginKind.NATIVE,
    },
    createContextStore: async () =>
      createEncryptedContextStore(createBlobStore(), cipher),
  };
}
