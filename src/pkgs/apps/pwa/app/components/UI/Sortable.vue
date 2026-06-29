<script setup lang="ts">
import {
  SORTABLE_KEY,
  type SortableContext,
  type SortablePayload,
} from "~/utils/sortable";

const emit = defineEmits<{ reorder: [payload: SortablePayload] }>();

const context: SortableContext = {
  instanceId: Symbol("sortable-list"),
  emit: (payload) => emit("reorder", payload),
};

provide(SORTABLE_KEY, context);
</script>

<template>
  <div class="uisortable">
    <slot />
  </div>
</template>

<style scoped>
.uisortable {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
