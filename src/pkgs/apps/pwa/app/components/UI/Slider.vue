<script setup lang="ts">
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from "reka-ui";

const model = defineModel<number[]>({ default: () => [50] });
defineProps<{ min?: number; max?: number; step?: number }>();
</script>

<template>
  <SliderRoot
    v-model="model"
    :min="min ?? 0"
    :max="max ?? 100"
    :step="step ?? 1"
    class="uisl"
  >
    <SliderTrack class="uisl__track">
      <SliderRange class="uisl__range" />
    </SliderTrack>
    <SliderThumb v-for="(_, i) in model" :key="i" class="uisl__thumb" />
  </SliderRoot>
</template>

<style scoped>
.uisl {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 22px;
  touch-action: none;
  user-select: none;
}
.uisl__track {
  position: relative;
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: var(--pt-border-muted);
}
.uisl__range {
  position: absolute;
  height: 100%;
  border-radius: 999px;
  background: var(--pt-ink);
}
.uisl__thumb {
  display: block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--pt-paper);
  border: 2px solid var(--pt-ink);
  box-shadow: 0 1px 3px rgba(var(--pt-ink-rgb), 0.2);
}
.uisl__thumb:focus-visible {
  outline: 2px solid var(--pt-ink);
  outline-offset: 2px;
}
</style>
