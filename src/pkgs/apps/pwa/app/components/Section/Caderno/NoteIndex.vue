<script setup lang="ts">
import type { Id, NotebookNode } from "@meu-caderno/core";
import { Aspect } from "@meu-caderno/core";
import { MASTERY_LABEL, masteryOf } from "~/utils/concepts";

const props = defineProps<{ nodes: NotebookNode[] }>();
const emit = defineEmits<{ open: [id: Id] }>();

const ASPECT_LABEL: Record<Aspect, string> = {
  [Aspect.NOTE]: "Nota",
  [Aspect.CONCEPT]: "Conceito",
  [Aspect.TASK]: "Tarefa",
  [Aspect.WORK]: "Trabalho",
};

const sorted = computed(() =>
  [...props.nodes].sort((left, right) => left.title.localeCompare(right.title)),
);

function aspectText(node: NotebookNode): string {
  return node.aspects.map((aspect) => ASPECT_LABEL[aspect]).join(" · ");
}
function domainText(node: NotebookNode): string {
  return node.aspects.includes(Aspect.CONCEPT)
    ? MASTERY_LABEL[masteryOf(node)]
    : "—";
}
</script>

<template>
  <div class="note-index">
    <div class="note-index__head">
      <span>Nome</span>
      <span class="note-index__col">Tipo</span>
      <span class="note-index__col">Domínio</span>
    </div>
    <button
      v-for="node in sorted"
      :key="node.id"
      type="button"
      class="note-index__row"
      @click="emit('open', node.id)"
    >
      <span class="note-index__name">{{ node.title }}</span>
      <span class="note-index__col">{{ aspectText(node) }}</span>
      <span class="note-index__col">{{ domainText(node) }}</span>
    </button>
  </div>
</template>

<style scoped>
.note-index {
  display: flex;
  flex-direction: column;
  border: 1.5px solid var(--pt-border-faint);
  border-radius: var(--pt-radius-sm);
  overflow: hidden;
}
.note-index__head,
.note-index__row {
  display: grid;
  grid-template-columns: 1fr 120px 100px;
  gap: 10px;
  align-items: center;
  padding: 9px 12px;
}
.note-index__head {
  font-size: calc(11px * var(--pt-text-scale));
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--pt-ink-muted);
  background: var(--pt-paper-2);
  border-bottom: 1.5px solid var(--pt-border-faint);
}
.note-index__row {
  border: none;
  border-bottom: 1px solid var(--pt-border-faint);
  background: var(--pt-card);
  font-family: inherit;
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink);
  text-align: left;
  cursor: pointer;
}
.note-index__row:last-child {
  border-bottom: none;
}
.note-index__row:hover {
  background: var(--pt-paper);
}
.note-index__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
}
.note-index__col {
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
@container (max-width: 480px) {
  .note-index__head,
  .note-index__row {
    grid-template-columns: 1fr 80px;
  }
  .note-index__col:last-child {
    display: none;
  }
}
</style>
