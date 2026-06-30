<script setup lang="ts">
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import type { Id, NotebookNode } from "@meu-caderno/core";
import { Aspect, children } from "@meu-caderno/core";

const props = defineProps<{
  node: NotebookNode;
  nodes: NotebookNode[];
  depth?: number;
}>();
const emit = defineEmits<{ select: [node: NotebookNode] }>();

const { service } = useCadernoService();

const ASPECT_GLYPH: Record<Aspect, string> = {
  [Aspect.NOTE]: "✏️",
  [Aspect.CONCEPT]: "💡",
  [Aspect.TASK]: "✅",
  [Aspect.WORK]: "📦",
};

const kids = computed(() => children(props.nodes, props.node.id));
const open = ref((props.depth ?? 0) < 1);
const glyph = computed(
  () => ASPECT_GLYPH[props.node.aspects[0] ?? Aspect.NOTE],
);

const main = ref<HTMLElement | null>(null);
const line = ref<HTMLElement | null>(null);
const isOver = ref(false);

async function reparentInto(childId: Id) {
  if (childId === props.node.id) return;
  const dragged = props.nodes.find((node) => node.id === childId);
  if (!dragged || dragged.parentId === props.node.id) return;
  await service.updateNode({ ...dragged, parentId: props.node.id });
}

let cleanup = () => {};

onMounted(() => {
  const handle = main.value;
  const target = line.value;
  if (!handle || !target) return;
  cleanup = combine(
    draggable({
      element: handle,
      getInitialData: () => ({ noteId: props.node.id }),
    }),
    dropTargetForElements({
      element: target,
      canDrop: ({ source }) => source.data.noteId !== props.node.id,
      getData: () => ({ noteId: props.node.id }),
      onDragEnter: () => {
        isOver.value = true;
      },
      onDragLeave: () => {
        isOver.value = false;
      },
      onDrop: ({ source }) => {
        isOver.value = false;
        const childId = source.data.noteId;
        if (typeof childId === "string") void reparentInto(childId as Id);
      },
    }),
  );
});

onUnmounted(() => cleanup());
</script>

<template>
  <div class="note-row">
    <div
      ref="line"
      class="note-row__line"
      :class="{ 'note-row__line--over': isOver }"
    >
      <button
        v-if="kids.length"
        type="button"
        class="note-row__toggle"
        :aria-label="open ? 'Recolher' : 'Expandir'"
        @click="open = !open"
      >
        <UIIcon :icon="open ? 'chevron-down' : 'chevron-right'" :size="15" />
      </button>
      <span v-else class="note-row__spacer" />
      <button
        ref="main"
        type="button"
        class="note-row__main"
        @click="emit('select', node)"
      >
        <span class="note-row__glyph">{{ glyph }}</span>
        <span class="note-row__title">{{ node.title }}</span>
        <span v-if="kids.length" class="note-row__count">{{ kids.length }}</span>
      </button>
    </div>
    <div v-if="open && kids.length" class="note-row__kids">
      <SectionCadernoNoteRow
        v-for="kid in kids"
        :key="kid.id"
        :node="kid"
        :nodes="nodes"
        :depth="(depth ?? 0) + 1"
        @select="emit('select', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.note-row {
  display: flex;
  flex-direction: column;
}
.note-row__line {
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid transparent;
}
.note-row__line--over {
  border-color: var(--pt-accent);
  background: var(--pt-card);
}
.note-row__toggle,
.note-row__spacer {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  color: var(--pt-ink-muted);
  cursor: pointer;
}
.note-row__main {
  display: flex;
  align-items: center;
  gap: 9px;
  flex: 1;
  min-width: 0;
  font-family: inherit;
  font-size: calc(14px * var(--pt-text-scale));
  text-align: left;
  padding: 8px 10px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid transparent;
  background: none;
  color: var(--pt-ink);
  cursor: pointer;
}
.note-row__main:hover {
  background: var(--pt-card);
  border-color: var(--pt-border-faint);
}
.note-row__glyph {
  font-size: calc(15px * var(--pt-text-scale));
  line-height: 1;
  flex-shrink: 0;
}
.note-row__title {
  flex: 1;
  font-weight: 600;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.note-row__count {
  font-size: calc(11px * var(--pt-text-scale));
  font-weight: 700;
  color: var(--pt-ink-muted);
  background: var(--pt-card);
  padding: 1px 7px;
  border-radius: var(--pt-radius-pill);
}
.note-row__kids {
  margin-left: 16px;
  border-left: 1.5px dashed var(--pt-border-faint);
  padding-left: 4px;
}
</style>
