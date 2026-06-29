<script setup lang="ts">
import type { IconName } from "./Icon.vue";

type Variant = "primal" | "leve" | "perigo" | "fantasma";

withDefaults(
  defineProps<{
    label?: string;
    variant?: Variant;
    icon?: IconName | "";
    full?: boolean;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
  }>(),
  { variant: "primal", icon: "", full: false, type: "button", disabled: false },
);

defineEmits<(e: "click", ev: MouseEvent) => void>();
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="pt-btn"
    :class="[`pt-btn--${variant}`, { 'pt-btn--full': full }]"
    @click="$emit('click', $event)"
  >
    <UIIcon v-if="icon" :icon="icon" :size="16" />
    <span v-if="label || $slots.default"><slot>{{ label }}</slot></span>
  </button>
</template>

<style scoped>
.pt-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-family: inherit;
  font-size: calc(15px * var(--pt-text-scale));
  font-weight: 600;
  line-height: 1.2;
  cursor: pointer;
  border-radius: var(--pt-radius);
  padding: 12px 18px;
  white-space: nowrap;
  user-select: none;
  box-sizing: border-box;
  transition: transform 0.06s ease, box-shadow 0.12s ease;
}
.pt-btn--full {
  display: flex;
  width: 100%;
}
.pt-btn:active {
  transform: translate(1px, 1px);
}
.pt-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.pt-btn--primal {
  background: var(--pt-accent);
  color: var(--pt-on-accent);
  border: var(--pt-stroke) solid var(--pt-accent);
  box-shadow: var(--pt-shadow-strong);
}
.pt-btn--leve {
  background: var(--pt-card);
  color: var(--pt-ink);
  border: var(--pt-stroke) solid var(--pt-ink);
}
.pt-btn--perigo {
  background: var(--pt-danger-soft);
  color: var(--pt-danger);
  border: var(--pt-stroke) solid var(--pt-danger);
}
.pt-btn--fantasma {
  background: transparent;
  color: var(--pt-ink-faint);
  border: var(--pt-stroke) dashed var(--pt-border-muted);
}
</style>
