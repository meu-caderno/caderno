import type { Backup, Identified, Repository } from "@meu-caderno/core";
import {
  type BackupCollections,
  exportBackup,
  migrateBackup,
} from "@meu-caderno/validation";

async function putAll<T extends Identified>(
  repository: Pick<Repository<T>, "put">,
  items: readonly T[],
): Promise<void> {
  for (const item of items) await repository.put(item);
}

const ENCRYPTED_FORMAT = "caderno-encrypted";

interface EncryptedEnvelope {
  format: typeof ENCRYPTED_FORMAT;
  version: 1;
  payload: string;
}

export function useBackup() {
  const { store, config, clock, cipher } = useCadernoService();
  const busy = ref(false);

  function triggerDownload(text: string, name: string) {
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function collect(): Promise<BackupCollections> {
    const [
      contexts,
      subjects,
      records,
      activities,
      library,
      nodes,
      edges,
      profiles,
      moods,
    ] = await Promise.all([
      store.contexts.list(),
      store.subjects.list(),
      store.records.list(),
      store.activities.list(),
      store.library.list(),
      store.graph.nodes.list(),
      store.graph.edges.list(),
      config.profiles.list(),
      config.moods.list(),
    ]);
    return {
      contexts,
      subjects,
      records,
      activities,
      library,
      nodes,
      edges,
      profiles,
      moods,
    };
  }

  async function downloadBackup(encrypted = false): Promise<void> {
    if (busy.value) return;
    busy.value = true;
    try {
      const exportedAt = await clock.now();
      const backup = exportBackup(await collect(), exportedAt);
      const json = JSON.stringify(backup, null, 2);
      const day = new Date(exportedAt).toISOString().slice(0, 10);
      if (encrypted) {
        const envelope: EncryptedEnvelope = {
          format: ENCRYPTED_FORMAT,
          version: 1,
          payload: await cipher.encrypt(json),
        };
        triggerDownload(
          JSON.stringify(envelope),
          `caderno-${day}.cifrado.json`,
        );
      } else {
        triggerDownload(json, `caderno-${day}.json`);
      }
    } finally {
      busy.value = false;
    }
  }

  async function writeBackup(backup: Backup): Promise<void> {
    await store.transaction(async (tx) => {
      await putAll(tx.contexts, backup.contexts);
      await putAll(tx.subjects, backup.subjects);
      await putAll(tx.records, backup.records);
      await putAll(tx.activities, backup.activities);
      await putAll(tx.library, backup.library);
      await putAll(tx.graph.nodes, backup.nodes);
      await putAll(tx.graph.edges, backup.edges);
    });
    await putAll(config.profiles, backup.profiles ?? []);
    await putAll(config.moods, backup.moods ?? []);
  }

  function isEncrypted(data: unknown): data is EncryptedEnvelope {
    return (
      typeof data === "object" &&
      data !== null &&
      (data as Partial<EncryptedEnvelope>).format === ENCRYPTED_FORMAT
    );
  }

  async function importFile(file: File): Promise<Backup> {
    if (busy.value) throw new Error("ocupado");
    busy.value = true;
    try {
      const parsed = JSON.parse(await file.text());
      const raw = isEncrypted(parsed)
        ? JSON.parse(await cipher.decrypt(parsed.payload))
        : parsed;
      const backup = migrateBackup(raw);
      await writeBackup(backup);
      return backup;
    } finally {
      busy.value = false;
    }
  }

  return { busy, downloadBackup, importFile };
}
