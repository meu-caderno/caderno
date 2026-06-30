<script setup lang="ts">
import type { OpLogEntry, Timestamp } from "@meu-caderno/core";
import { OpKind } from "@meu-caderno/core";
import { format } from "date-fns";

const { store } = useCadernoService();

const entries = ref<OpLogEntry[]>([]);
const LIMIT = 60;

async function refresh() {
  const all = await store.oplog.since(0 as Timestamp);
  entries.value = [...all]
    .sort((left, right) => right.ts - left.ts)
    .slice(0, LIMIT);
}

const ENTITY_LABEL: Record<string, string> = {
  CONTEXT: "Contexto",
  SUBJECT: "Disciplina",
  RECORD: "Presença",
  ACTIVITY: "Atividade",
  LIBRARY: "Acervo",
  NODE: "Nota",
  EDGE: "Conexão",
};

function label(entity: string) {
  return ENTITY_LABEL[entity] ?? entity;
}
function when(timestamp: number) {
  return format(new Date(timestamp), "dd/MM HH:mm:ss");
}

onMounted(refresh);
onUnmounted(store.subscribe(() => refresh()));
</script>

<template>
  <SectionSettingsCard
    title="Histórico de alterações"
    subtitle="Registro append-only das operações neste aparelho."
  >
    <template #actions>
      <button
        type="button"
        class="oplog-card__refresh"
        aria-label="Atualizar"
        @click="refresh"
      >
        <UIIcon icon="rotate-ccw" :size="15" />
      </button>
    </template>

    <p v-if="!entries.length" class="oplog-card__empty">Nada registrado ainda.</p>
    <div v-else class="oplog-card__list">
      <div
        v-for="(entry, index) in entries"
        :key="`${entry.ts}-${entry.id}-${index}`"
        class="oplog-card__row"
      >
        <span
          class="oplog-card__op"
          :class="
            entry.op === OpKind.DELETE
              ? 'oplog-card__op--del'
              : 'oplog-card__op--put'
          "
        >
          {{ entry.op === OpKind.DELETE ? "−" : "+" }}
        </span>
        <span class="oplog-card__entity">{{ label(entry.entity) }}</span>
        <span class="oplog-card__time">{{ when(entry.ts) }}</span>
      </div>
    </div>
  </SectionSettingsCard>
</template>

<style scoped>
.oplog-card__refresh {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: var(--pt-radius-sm);
  border: none;
  background: var(--pt-paper-2);
  color: var(--pt-ink-muted);
  cursor: pointer;
}
.oplog-card__empty {
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  margin: 0;
}
.oplog-card__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 320px;
  overflow-y: auto;
}
.oplog-card__row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 2px;
  border-bottom: 1.5px dashed var(--pt-border-faint);
  font-size: calc(13px * var(--pt-text-scale));
}
.oplog-card__op {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-weight: 800;
}
.oplog-card__op--put {
  background: var(--pt-ok-soft);
  color: var(--pt-ok);
}
.oplog-card__op--del {
  background: var(--pt-danger-soft);
  color: var(--pt-danger);
}
.oplog-card__entity {
  flex: 1;
  font-weight: 600;
}
.oplog-card__time {
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  font-variant-numeric: tabular-nums;
}
</style>
