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
  font-size: 13px;
  font-weight: 600;
}
.uif__hint {
  font-size: 12px;
  color: var(--pt-ink-muted);
}
</style>
