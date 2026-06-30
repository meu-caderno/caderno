<script setup lang="ts">
import type { NotebookNode } from "@meu-caderno/core";
import {
  MASTERY_COLOR,
  MASTERY_LABEL,
  masteryOf,
  nextMastery,
} from "~/utils/concepts";

const props = defineProps<{ queue: NotebookNode[] }>();
const emit = defineEmits<{ select: [node: NotebookNode] }>();

const { service } = useCadernoService();

async function advance(node: NotebookNode) {
  await service.updateNode({ ...node, mastery: nextMastery(node.mastery) });
}
</script>

<template>
  <UIEmptyState
    v-if="!props.queue.length"
    icon="🎉"
    title="Tudo revisado"
    subtitle="Nenhum conceito pendente de revisão. Bom trabalho!"
  />
  <div v-else class="review-mode">
    <div v-for="node in props.queue" :key="node.id" class="review-mode__row">
      <button
        type="button"
        class="review-mode__main"
        @click="emit('select', node)"
      >
        <span class="review-mode__title">{{ node.title }}</span>
        <UIBadge
          tone="custom"
          :color="MASTERY_COLOR[masteryOf(node)]"
          bordered
          dot
          :label="MASTERY_LABEL[masteryOf(node)]"
        />
      </button>
      <button
        type="button"
        class="review-mode__advance"
        aria-label="Avancei na maestria"
        @click="advance(node)"
      >
        ✓ avancei
      </button>
    </div>
  </div>
</template>

<style scoped>
.review-mode {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.review-mode__row {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-faint);
  background: var(--pt-card);
  padding: 4px 8px;
}
.review-mode__main {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
  font-family: inherit;
  font-size: calc(14px * var(--pt-text-scale));
  text-align: left;
  padding: 6px 4px;
  border: none;
  background: none;
  color: var(--pt-ink);
  cursor: pointer;
}
.review-mode__title {
  flex: 1;
  font-weight: 600;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.review-mode__advance {
  flex-shrink: 0;
  font-family: inherit;
  font-size: calc(12px * var(--pt-text-scale));
  font-weight: 700;
  padding: 6px 12px;
  border-radius: var(--pt-radius-pill);
  border: 1.5px solid var(--pt-ok);
  background: none;
  color: var(--pt-ok);
  cursor: pointer;
}
</style>
