<script setup lang="ts">
import type { NotebookNode } from "@meu-caderno/core";
import { groupByMastery, MASTERY_LABEL } from "~/utils/concepts";

const props = defineProps<{ concepts: NotebookNode[] }>();
const emit = defineEmits<{ select: [node: NotebookNode] }>();

const { linksOf } = useNotebook();

const columns = computed(() => groupByMastery(props.concepts));

function linkCount(node: NotebookNode): number {
  return linksOf(node.id).length;
}
</script>

<template>
  <div class="concept-board">
    <div
      v-for="column in columns"
      :key="column.mastery"
      class="concept-board__col"
    >
      <div class="concept-board__col-head">
        <span class="concept-board__dot" :style="{ background: column.color }" />
        <span class="concept-board__col-title">{{ column.label }}</span>
        <span class="concept-board__col-count">{{ column.items.length }}</span>
      </div>
      <button
        v-for="node in column.items"
        :key="node.id"
        type="button"
        class="concept-board__card"
        :style="{ borderLeftColor: column.color }"
        @click="emit('select', node)"
      >
        <span class="concept-board__card-title">{{ node.title }}</span>
        <span class="concept-board__card-links">
          <UIIcon icon="link" :size="12" />
          {{ linkCount(node) }}
        </span>
      </button>
      <p v-if="!column.items.length" class="concept-board__empty">
        Nenhum conceito “{{ MASTERY_LABEL[column.mastery] }}”.
      </p>
    </div>
  </div>
</template>

<style scoped>
.concept-board {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@container (min-width: 640px) {
  .concept-board {
    grid-template-columns: repeat(3, 1fr);
  }
}
.concept-board__col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.concept-board__col-head {
  display: flex;
  align-items: center;
  gap: 7px;
}
.concept-board__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.concept-board__col-title {
  font-size: calc(12px * var(--pt-text-scale));
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--pt-ink-muted);
}
.concept-board__col-count {
  font-size: calc(11px * var(--pt-text-scale));
  font-weight: 700;
  color: var(--pt-ink-muted);
  background: var(--pt-card);
  padding: 1px 7px;
  border-radius: var(--pt-radius-pill);
}
.concept-board__card {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  font-family: inherit;
  font-size: calc(14px * var(--pt-text-scale));
  text-align: left;
  padding: 10px 12px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-faint);
  border-left: 4px solid var(--pt-border-faint);
  background: var(--pt-card);
  color: var(--pt-ink);
  cursor: pointer;
}
.concept-board__card-title {
  flex: 1;
  font-weight: 600;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.concept-board__card-links {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  font-size: calc(12px * var(--pt-text-scale));
  font-weight: 700;
  color: var(--pt-ink-muted);
}
.concept-board__empty {
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  margin: 0;
  padding: 4px 2px;
}
</style>
