<script setup lang="ts">
import { ProgressIndicator, ProgressRoot } from "reka-ui";

const props = defineProps<{ value: number; max?: number; color?: string }>();
const pct = computed(() =>
  Math.max(0, Math.min(100, (props.value / (props.max ?? 100)) * 100)),
);
</script>

<template>
  <ProgressRoot :model-value="value" :max="max ?? 100" class="uiprog">
    <ProgressIndicator
      class="uiprog__bar"
      :style="{ width: `${pct}%`, background: color ?? 'var(--pt-ink)' }"
    />
  </ProgressRoot>
</template>

<style scoped>
.uiprog {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: var(--pt-border-faint);
}
.uiprog__bar {
  height: 100%;
  border-radius: 999px;
  transition: width 0.25s ease;
}
</style>
