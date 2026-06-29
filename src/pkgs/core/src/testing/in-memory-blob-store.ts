import type {
  BlobLog,
  BlobRepository,
  BlobRow,
  BlobStore,
  BlobTx,
  Cipher,
} from "../domain";

interface Snapshotable {
  snapshot(): unknown;
  restore(state: unknown): void;
}

type MemBlobRepository = BlobRepository & Snapshotable;
type MemBlobLog = BlobLog & Snapshotable;

function createBlobRepo(): MemBlobRepository {
  let map = new Map<string, BlobRow>();
  return {
    async get(id) {
      return map.get(id);
    },
    async list() {
      return [...map.values()];
    },
    async put(row) {
      map.set(row.id, row);
    },
    async delete(id) {
      map.delete(id);
    },
    snapshot() {
      return new Map(map);
    },
    restore(state) {
      map = new Map(state as Map<string, BlobRow>);
    },
  };
}

function createBlobLog(): MemBlobLog {
  let entries: string[] = [];
  return {
    async append(data) {
      entries.push(data);
    },
    async appendMany(many) {
      entries.push(...many);
    },
    async list() {
      return [...entries];
    },
    snapshot() {
      return [...entries];
    },
    restore(state) {
      entries = [...(state as string[])];
    },
  };
}

export function createInMemoryBlobStore(): BlobStore {
  const repos = {
    contexts: createBlobRepo(),
    subjects: createBlobRepo(),
    records: createBlobRepo(),
    activities: createBlobRepo(),
    library: createBlobRepo(),
    nodes: createBlobRepo(),
    edges: createBlobRepo(),
  };
  const oplog = createBlobLog();
  const tx: BlobTx = { ...repos, oplog };
  const snapshotables: Snapshotable[] = [...Object.values(repos), oplog];
  return {
    ...tx,
    async transaction(work) {
      const snaps = snapshotables.map((s) => s.snapshot());
      try {
        return await work(tx);
      } catch (error) {
        snapshotables.forEach((s, i) => {
          s.restore(snaps[i]);
        });
        throw error;
      }
    },
  };
}

export const reversibleCipher: Cipher = {
  encrypt: async (plaintext) => `enc:${plaintext}`,
  decrypt: async (ciphertext) => ciphertext.slice(4),
};
