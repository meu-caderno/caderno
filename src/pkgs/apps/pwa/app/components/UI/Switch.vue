<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from "reka-ui";

const model = defineModel<boolean>({ default: false });
defineProps<{ label?: string; hint?: string; disabled?: boolean }>();
</script>

<template>
  <label class="uisw" :class="{ 'uisw--disabled': disabled }">
    <SwitchRoot v-model="model" :disabled="disabled" class="uisw__root">
      <SwitchThumb class="uisw__thumb" />
    </SwitchRoot>
    <span v-if="label || hint" class="uisw__text">
      <span v-if="label" class="uisw__label">{{ label }}</span>
      <span v-if="hint" class="uisw__hint">{{ hint }}</span>
    </span>
  </label>
</template>

<style scoped>
.uisw--disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.uisw {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}
.uisw__root {
  flex-shrink: 0;
  width: 42px;
  height: 25px;
  border-radius: 999px;
  border: none;
  background: var(--pt-border-muted);
  position: relative;
  cursor: pointer;
  transition: background 0.15s;
}
.uisw__root[data-state="checked"] {
  background: var(--pt-accent);
}
.uisw__thumb {
  display: block;
  width: 19px;
  height: 19px;
  border-radius: 50%;
  background: var(--pt-paper);
  transform: translateX(3px);
  transition: transform 0.15s;
  will-change: transform;
}
.uisw__thumb[data-state="checked"] {
  transform: translateX(20px);
}
.uisw__text {
  display: flex;
  flex-direction: column;
}
.uisw__label {
  font-size: calc(14px * var(--pt-text-scale));
  font-weight: 600;
}
.uisw__hint {
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
</style>
