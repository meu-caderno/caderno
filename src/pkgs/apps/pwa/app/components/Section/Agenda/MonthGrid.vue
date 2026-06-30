<script setup lang="ts">
import type { DayIso } from "@meu-caderno/core";
import { addDays, weekdayOf } from "@meu-caderno/core";
import type { AgendaDay } from "~/composables/useAgenda";

const WEEKDAY_HEADS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];
const GRID_CELLS = 42;

function firstOfMonth(day: DayIso): DayIso {
  return `${day.slice(0, 7)}-01` as DayIso;
}

function shiftMonth(anchor: DayIso, delta: number): DayIso {
  const year = Number(anchor.slice(0, 4));
  const month = Number(anchor.slice(5, 7));
  const total = year * 12 + (month - 1) + delta;
  const nextYear = Math.floor(total / 12);
  const nextMonth = String((total % 12) + 1).padStart(2, "0");
  return `${nextYear}-${nextMonth}-01` as DayIso;
}

const { daysInRange, today } = useAgenda();
const monthAnchor = ref<DayIso>(firstOfMonth(today.value as DayIso));
const selected = ref<DayIso>(today.value as DayIso);

const monthLabel = computed(() => {
  const month = Number(monthAnchor.value.slice(5, 7));
  return `${MONTHS[month - 1]} ${monthAnchor.value.slice(0, 4)}`;
});

const cells = computed<AgendaDay[]>(() => {
  const gridStart = addDays(monthAnchor.value, -weekdayOf(monthAnchor.value));
  return daysInRange(gridStart, addDays(gridStart, GRID_CELLS - 1));
});

const selectedDay = computed(
  () => daysInRange(selected.value, selected.value)[0],
);

function inMonth(day: AgendaDay): boolean {
  return day.day.slice(0, 7) === monthAnchor.value.slice(0, 7);
}

function shift(delta: number): void {
  monthAnchor.value = shiftMonth(monthAnchor.value, delta);
}

function select(day: AgendaDay): void {
  selected.value = day.day;
}
</script>

<template>
  <section class="month-grid">
    <header class="month-grid__nav">
      <UIChip label="‹" @click="shift(-1)" />
      <span class="month-grid__label">{{ monthLabel }}</span>
      <UIChip label="›" @click="shift(1)" />
    </header>

    <div class="month-grid__heads">
      <span v-for="head in WEEKDAY_HEADS" :key="head" class="month-grid__head">
        {{ head }}
      </span>
    </div>

    <div class="month-grid__cells">
      <SectionAgendaMonthCell
        v-for="day in cells"
        :key="day.day"
        :day="day"
        :in-month="inMonth(day)"
        :selected="day.day === selected"
        @select="select"
      />
    </div>

    <div v-if="selectedDay" class="month-grid__detail">
      <header class="month-grid__detail-head">
        <strong>{{ selectedDay.weekdayLabel }}</strong>
        <span class="month-grid__detail-date">{{ selectedDay.dayLabel }}</span>
      </header>
      <SectionAgendaDayPills :day="selectedDay" />
    </div>
  </section>
</template>

<style scoped>
.month-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.month-grid__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.month-grid__label {
  font-size: calc(14px * var(--pt-text-scale));
  font-weight: 700;
  text-transform: capitalize;
}
.month-grid__heads,
.month-grid__cells {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}
.month-grid__head {
  text-align: center;
  font-size: calc(11px * var(--pt-text-scale));
  font-weight: 700;
  text-transform: uppercase;
  color: var(--pt-ink-muted);
}
.month-grid__detail {
  margin-top: 6px;
  padding: 12px 14px;
  border-radius: var(--pt-radius-sm);
  border: var(--pt-stroke) solid var(--pt-border-muted);
  background: var(--pt-card);
}
.month-grid__detail-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
}
.month-grid__detail-head strong {
  text-transform: uppercase;
  font-size: calc(12px * var(--pt-text-scale));
  letter-spacing: 0.04em;
}
.month-grid__detail-date {
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
</style>
