<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string;
    icon?: string;
    selected?: boolean;
  }>(),
  { selected: false },
);

defineEmits<(e: "click", ev: MouseEvent) => void>();
</script>

<template>
  <button
    type="button"
    class="pt-chip"
    :class="{ 'pt-chip--on': selected }"
    @click="$emit('click', $event)"
  >
    <span v-if="icon" class="pt-chip__icon">{{ icon }}</span>
    <slot>{{ label }}</slot>
  </button>
</template>

<style scoped>
.pt-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
  padding: 7px 13px;
  border-radius: var(--pt-radius-pill);
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  background: var(--pt-card);
  color: var(--pt-ink);
  border: var(--pt-stroke) solid var(--pt-border-muted);
}
.pt-chip--on {
  background: var(--pt-ink);
  color: var(--pt-on-ink);
  border-color: var(--pt-ink);
}
.pt-chip__icon {
  font-size: 13px;
  line-height: 1;
}
</style>
