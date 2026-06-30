<script setup lang="ts">
import type { DayIso } from "@meu-caderno/core";
import { addDays } from "@meu-caderno/core";

const { daysInRange, today } = useAgenda();
const current = ref<DayIso>(today.value as DayIso);

const day = computed(() => daysInRange(current.value, current.value)[0]);

function shift(delta: number): void {
  current.value = addDays(current.value, delta);
}
</script>

<template>
  <section class="day-view">
    <header class="day-view__nav">
      <UIChip label="‹" @click="shift(-1)" />
      <div class="day-view__title">
        <strong class="day-view__weekday">{{ day?.weekdayLabel }}</strong>
        <span class="day-view__date">{{ day?.dayLabel }}</span>
        <UIBadge v-if="day?.isToday" tone="ok">hoje</UIBadge>
      </div>
      <UIChip label="›" @click="shift(1)" />
    </header>

    <UICard v-if="day">
      <SectionAgendaDayPills :day="day" />
    </UICard>
  </section>
</template>

<style scoped>
.day-view {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.day-view__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.day-view__title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex: 1;
  justify-content: center;
}
.day-view__weekday {
  text-transform: uppercase;
  font-size: calc(14px * var(--pt-text-scale));
  letter-spacing: 0.04em;
}
.day-view__date {
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
</style>
