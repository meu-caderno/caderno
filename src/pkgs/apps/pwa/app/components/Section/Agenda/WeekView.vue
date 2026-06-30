<script setup lang="ts">
import type { DayIso } from "@meu-caderno/core";
import { addDays, weekdayOf } from "@meu-caderno/core";

const { daysInRange, today } = useAgenda();
const anchor = ref<DayIso>(today.value as DayIso);

const weekStart = computed(() =>
  addDays(anchor.value, -weekdayOf(anchor.value)),
);
const days = computed(() =>
  daysInRange(weekStart.value, addDays(weekStart.value, 6)),
);
const rangeLabel = computed(
  () => `${days.value[0]?.dayLabel} – ${days.value[6]?.dayLabel}`,
);

function shiftWeek(delta: number): void {
  anchor.value = addDays(anchor.value, delta * 7);
}
</script>

<template>
  <section class="week-view">
    <header class="week-view__nav">
      <UIChip label="‹" @click="shiftWeek(-1)" />
      <span class="week-view__range">{{ rangeLabel }}</span>
      <UIChip label="›" @click="shiftWeek(1)" />
    </header>

    <div class="week-view__grid">
      <UICard
        v-for="day in days"
        :key="day.day"
        flat
        :accent="day.isToday ? 'var(--pt-ink)' : undefined"
      >
        <header class="week-view__day-head">
          <strong class="week-view__weekday">{{ day.weekdayLabel }}</strong>
          <span class="week-view__date">{{ day.dayLabel }}</span>
        </header>
        <SectionAgendaDayPills :day="day" />
      </UICard>
    </div>
  </section>
</template>

<style scoped>
.week-view {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.week-view__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.week-view__range {
  font-size: calc(13px * var(--pt-text-scale));
  font-weight: 700;
}
.week-view__grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.week-view__day-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
}
.week-view__weekday {
  text-transform: uppercase;
  font-size: calc(12px * var(--pt-text-scale));
  letter-spacing: 0.04em;
}
.week-view__date {
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
</style>
