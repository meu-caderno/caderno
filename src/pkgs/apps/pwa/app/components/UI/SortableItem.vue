<script setup lang="ts">
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  attachClosestEdge,
  type Edge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { SORTABLE_KEY } from "~/utils/sortable";

const props = defineProps<{ id: string }>();

const context = inject(SORTABLE_KEY);
const elementRef = ref<HTMLElement | null>(null);
const handle = ref<HTMLElement | null>(null);
const edge = ref<Edge | null>(null);
const dragging = ref(false);

let cleanup = () => {};

onMounted(() => {
  const element = elementRef.value;
  const dragHandle = handle.value;
  if (!element || !dragHandle || !context) return;
  cleanup = combine(
    draggable({
      element,
      dragHandle,
      getInitialData: () => ({
        sortableId: props.id,
        instanceId: context.instanceId,
      }),
      onDragStart: () => {
        dragging.value = true;
      },
      onDrop: () => {
        dragging.value = false;
      },
    }),
    dropTargetForElements({
      element,
      canDrop: ({ source }) => source.data.instanceId === context.instanceId,
      getData: ({ input }) =>
        attachClosestEdge(
          { sortableId: props.id },
          { element, input, allowedEdges: ["top", "bottom"] },
        ),
      onDrag: (args) => {
        edge.value = extractClosestEdge(args.self.data);
      },
      onDragLeave: () => {
        edge.value = null;
      },
      onDrop: (args) => {
        const dropEdge = extractClosestEdge(args.self.data);
        edge.value = null;
        const fromId = args.source.data.sortableId;
        if (
          typeof fromId === "string" &&
          fromId !== props.id &&
          (dropEdge === "top" || dropEdge === "bottom")
        ) {
          context.emit({ fromId, toId: props.id, edge: dropEdge });
        }
      },
    }),
  );
});

onUnmounted(() => cleanup());
</script>

<template>
  <div
    ref="elementRef"
    class="uisortable-item"
    :class="{ 'uisortable-item--dragging': dragging }"
  >
    <span
      ref="handle"
      class="uisortable-item__handle"
      aria-label="Arrastar para reordenar"
    >
      <UIIcon icon="more-horizontal" :size="16" />
    </span>
    <div class="uisortable-item__body">
      <slot />
    </div>
    <div
      v-if="edge === 'top'"
      class="uisortable-item__line uisortable-item__line--top"
    />
    <div
      v-if="edge === 'bottom'"
      class="uisortable-item__line uisortable-item__line--bottom"
    />
  </div>
</template>

<style scoped>
.uisortable-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}
.uisortable-item--dragging {
  opacity: 0.4;
}
.uisortable-item__handle {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: var(--pt-radius-sm);
  color: var(--pt-ink-faint);
  cursor: grab;
}
.uisortable-item__handle:active {
  cursor: grabbing;
}
.uisortable-item__body {
  flex: 1;
  min-width: 0;
}
.uisortable-item__line {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--pt-accent);
  pointer-events: none;
}
.uisortable-item__line--top {
  top: -5px;
}
.uisortable-item__line--bottom {
  bottom: -5px;
}
</style>
