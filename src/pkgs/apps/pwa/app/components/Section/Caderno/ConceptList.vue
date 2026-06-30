<script setup lang="ts">
import type { Node } from "@meu-caderno/core";
import {
  MASTERY_COLOR,
  MASTERY_LABEL,
  masteryOf,
  nextMastery,
} from "~/utils/concepts";

const props = defineProps<{ concepts: Node[] }>();
const emit = defineEmits<{ select: [node: Node] }>();

const { linksOf } = useNotebook();
const { service } = useCadernoService();

function linkCount(node: Node): number {
  return linksOf(node.id).length;
}

async function cycleMastery(node: Node) {
  await service.updateNode({ ...node, mastery: nextMastery(node.mastery) });
}
</script>

<template>
  <div class="concept-list">
    <div v-for="node in props.concepts" :key="node.id" class="concept-list__row">
      <button
        type="button"
        class="concept-list__main"
        @click="emit('select', node)"
      >
        <span class="concept-list__title">{{ node.title }}</span>
        <span class="concept-list__links">
          <UIIcon icon="link" :size="13" />
          {{ linkCount(node) }}
        </span>
      </button>
      <button
        type="button"
        class="concept-list__mastery"
        :aria-label="`Maestria: ${MASTERY_LABEL[masteryOf(node)]}`"
        @click="cycleMastery(node)"
      >
        <UIBadge
          tone="custom"
          :color="MASTERY_COLOR[masteryOf(node)]"
          bordered
          dot
          :label="MASTERY_LABEL[masteryOf(node)]"
        />
      </button>
    </div>
  </div>
</template>

<style scoped>
.concept-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.concept-list__row {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-faint);
  background: var(--pt-card);
  padding: 4px 8px;
}
.concept-list__main {
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
.concept-list__title {
  flex: 1;
  font-weight: 600;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.concept-list__links {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  font-size: calc(12px * var(--pt-text-scale));
  font-weight: 700;
  color: var(--pt-ink-muted);
}
.concept-list__mastery {
  flex-shrink: 0;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
}
</style>
