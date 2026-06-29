<script setup lang="ts">
defineProps<{ label?: string; hint?: string; for?: string }>();
</script>

<template>
  <div class="uif">
    <label v-if="label" :for="$props.for" class="uif__label">{{ label }}</label>
    <slot />
    <span v-if="hint" class="uif__hint">{{ hint }}</span>
  </div>
</template>

<style scoped>
.uif {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.uif__label {
  font-size: calc(13px * var(--pt-text-scale));
  font-weight: 600;
}
.uif__hint {
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
</style>
