import type { Backup } from "@meu-caderno/core";
import {
  type BackupCollections,
  exportBackup,
  migrateBackup,
} from "@meu-caderno/validation";

export function useBackup() {
  const { store, config, clock } = useCadernoService();
  const busy = ref(false);

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

  async function downloadBackup(): Promise<void> {
    if (busy.value) return;
    busy.value = true;
    try {
      const exportedAt = await clock.now();
      const backup = exportBackup(await collect(), exportedAt);
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const day = new Date(exportedAt).toISOString().slice(0, 10);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `caderno-${day}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      busy.value = false;
    }
  }

  async function writeBackup(backup: Backup): Promise<void> {
    await store.transaction(async (tx) => {
      for (const context of backup.contexts) await tx.contexts.put(context);
      for (const subject of backup.subjects) await tx.subjects.put(subject);
      for (const record of backup.records) await tx.records.put(record);
      for (const activity of backup.activities)
        await tx.activities.put(activity);
      for (const item of backup.library) await tx.library.put(item);
      for (const node of backup.nodes) await tx.graph.nodes.put(node);
      for (const edge of backup.edges) await tx.graph.edges.put(edge);
    });
    for (const profile of backup.profiles ?? [])
      await config.profiles.put(profile);
    for (const mood of backup.moods ?? []) await config.moods.put(mood);
  }

  async function importFile(file: File): Promise<Backup> {
    if (busy.value) throw new Error("ocupado");
    busy.value = true;
    try {
      const backup = migrateBackup(JSON.parse(await file.text()));
      await writeBackup(backup);
      return backup;
    } finally {
      busy.value = false;
    }
  }

  return { busy, downloadBackup, importFile };
}
