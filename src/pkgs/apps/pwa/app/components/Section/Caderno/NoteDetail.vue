<script setup lang="ts">
import type { Node } from "@meu-caderno/core";
import { Aspect, children } from "@meu-caderno/core";
import type { NoteLink } from "~/composables/useNotebook";

const props = defineProps<{ node: Node; nodes: Node[]; links: NoteLink[] }>();
const emit = defineEmits<{
  close: [];
  edit: [];
  delete: [];
  select: [node: Node];
}>();

const ASPECT_LABEL: Record<Aspect, string> = {
  [Aspect.NOTE]: "Nota",
  [Aspect.CONCEPT]: "Conceito",
  [Aspect.TASK]: "Tarefa",
  [Aspect.WORK]: "Trabalho",
};

const kids = computed(() => children(props.nodes, props.node.id));
</script>

<template>
  <UIModal :title="node.title" @close="emit('close')">
    <div class="note-detail">
      <div class="note-detail__aspects">
        <UIChip
          v-for="aspect in node.aspects"
          :key="aspect"
          :label="ASPECT_LABEL[aspect]"
        />
      </div>

      <p v-if="node.body" class="note-detail__body">{{ node.body }}</p>
      <p v-else class="note-detail__empty">Sem conteúdo.</p>

      <div v-if="kids.length" class="note-detail__children">
        <div class="pt-eyebrow">Sub-notas</div>
        <button
          v-for="kid in kids"
          :key="kid.id"
          type="button"
          class="note-detail__child"
          @click="emit('select', kid)"
        >
          <span class="note-detail__child-title">{{ kid.title }}</span>
          <UIIcon icon="chevron-right" :size="15" />
        </button>
      </div>

      <SectionCadernoNoteLinks :node="node" :nodes="nodes" :links="links" />

      <div class="note-detail__actions">
        <UIButton
          variant="fantasma"
          icon="trash"
          label="Excluir"
          @click="emit('delete')"
        />
        <div class="note-detail__spacer" />
        <UIButton
          variant="primal"
          icon="pencil"
          label="Editar"
          @click="emit('edit')"
        />
      </div>
    </div>
  </UIModal>
</template>

<style scoped>
.note-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.note-detail__aspects {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.note-detail__body {
  font-size: calc(14px * var(--pt-text-scale));
  line-height: 1.6;
  white-space: pre-wrap;
  margin: 0;
}
.note-detail__empty {
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  margin: 0;
}
.note-detail__children {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.note-detail__child {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-family: inherit;
  font-size: calc(14px * var(--pt-text-scale));
  font-weight: 600;
  padding: 10px 12px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink);
  cursor: pointer;
}
.note-detail__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.note-detail__spacer {
  flex: 1;
}
</style>
