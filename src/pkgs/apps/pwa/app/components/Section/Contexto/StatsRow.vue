<script setup lang="ts">
export interface ContextStat {
  key: string;
  label: string;
  value: string;
  hint?: string;
}

defineProps<{ stats: ContextStat[] }>();
</script>

<template>
  <div class="stats-row">
    <UICard
      v-for="stat in stats"
      :key="stat.key"
      class="stats-row__item"
      radius="16px"
      pad="14px"
    >
      <span class="stats-row__value">{{ stat.value }}</span>
      <span class="stats-row__label">{{ stat.label }}</span>
      <span v-if="stat.hint" class="stats-row__hint">{{ stat.hint }}</span>
    </UICard>
  </div>
</template>

<style scoped>
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.stats-row__item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.stats-row__value {
  font-size: calc(24px * var(--pt-text-scale));
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}
.stats-row__label {
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  font-weight: 600;
}
.stats-row__hint {
  font-size: calc(11px * var(--pt-text-scale));
  color: var(--pt-ink-faint);
}
</style>
