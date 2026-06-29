<script setup lang="ts">
import type { Activity, Id, Subject } from "@meu-caderno/core";
import { ActivityKind, Root } from "@meu-caderno/core";

const props = defineProps<{ items: Activity[]; subjects: Subject[] }>();
const emit = defineEmits<{ close: [] }>();

const { service } = useCadernoService();
const { activeId } = useActiveContext();

const picks = reactive<Record<string, string>>({});

const subjectOptions = computed(() => [
  { value: "", label: "— sem disciplina —" },
  ...props.subjects.map((subject) => ({
    value: subject.id as string,
    label: subject.name,
  })),
]);

async function promote(item: Activity) {
  const subjectId = picks[item.id];
  await service.upsertActivity({
    ...item,
    root: Root.CONTEXT,
    contextId: activeId.value ?? undefined,
    subjectId: subjectId ? (subjectId as Id) : undefined,
    kind: ActivityKind.TASK,
  });
}

async function discard(item: Activity) {
  await service.deleteActivity(item.id);
}
</script>

<template>
  <UIModal
    title="Inbox"
    subtitle="capture agora, organize com calma"
    @close="emit('close')"
  >
    <div v-if="items.length" class="inbox">
      <div v-for="item in items" :key="item.id" class="inbox__item">
        <div class="inbox__title">📥 {{ item.title }}</div>
        <div class="inbox__actions">
          <UISelect
            v-model="picks[item.id]"
            :options="subjectOptions"
            placeholder="— disciplina —"
          />
          <UIButton
            variant="fantasma"
            icon="check"
            label="Tarefa"
            @click="promote(item)"
          />
          <button
            type="button"
            class="inbox__discard"
            @click="discard(item)"
          >
            descartar
          </button>
        </div>
      </div>
    </div>
    <UIEmptyState
      v-else
      icon="📥"
      title="Inbox vazia"
      subtitle="Capture algo com ⌘K e ele aparece aqui."
    />
  </UIModal>
</template>

<style scoped>
.inbox {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.inbox__item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1.5px solid var(--pt-border-muted);
  border-radius: var(--pt-radius-sm);
  background: var(--pt-card);
}
.inbox__title {
  font-size: calc(14px * var(--pt-text-scale));
  font-weight: 600;
}
.inbox__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.inbox__actions :deep(.uisel__trigger) {
  flex: 1;
  min-width: 140px;
}
.inbox__discard {
  font-family: inherit;
  font-size: calc(13px * var(--pt-text-scale));
  font-weight: 600;
  color: var(--pt-ink-muted);
  background: none;
  border: none;
  cursor: pointer;
}
</style>
