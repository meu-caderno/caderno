<script setup lang="ts">
import type { IconName } from "./Icon.vue";

const props = withDefaults(
  defineProps<{
    variant?: "more" | "advanced";
    expanded?: boolean;
    label?: string;
    collapsedHint?: string;
    expandedLabel?: string;
    color?: string;
  }>(),
  { variant: "more", expanded: false, color: "var(--pt-info)" },
);

defineEmits<(e: "toggle", ev: Event) => void>();

const iconName = computed<IconName>(() => {
  if (props.variant === "advanced") {
    return props.expanded ? "chevron-down" : "chevron-right";
  }
  return props.expanded ? "minus" : "plus";
});

const baseLabel = computed(
  () => props.label ?? (props.variant === "advanced" ? "Avançado" : "mais"),
);

const displayLabel = computed(() => {
  if (props.variant === "advanced") return baseLabel.value;
  return props.expanded
    ? (props.expandedLabel ?? "menos")
    : baseLabel.value +
        (props.collapsedHint ? ` · ${props.collapsedHint}` : "");
});
</script>

<template>
  <button
    type="button"
    class="pt-expand"
    :style="{ color }"
    @click.stop="$emit('toggle', $event)"
  >
    <UIIcon :icon="iconName" :size="14" />
    {{ displayLabel }}
  </button>
</template>

<style scoped>
.pt-expand {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: inherit;
  font-size: calc(12px * var(--pt-text-scale));
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  padding: 2px 0;
  background: none;
  border: none;
}
</style>
