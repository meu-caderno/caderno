<script setup lang="ts">
import type { AgendaDay } from "~/composables/useAgenda";

const props = defineProps<{
  day: AgendaDay;
  inMonth: boolean;
  selected: boolean;
}>();

defineEmits<(eventName: "select", day: AgendaDay) => void>();

const MAX_DOTS = 3;

const dayNumber = computed(() => Number(props.day.day.slice(8, 10)));
const dots = computed(() => props.day.sessions.slice(0, MAX_DOTS));
const hasActivity = computed(() => props.day.activities.length > 0);
</script>

<template>
  <button
    type="button"
    class="month-cell"
    :class="{
      'month-cell--muted': !inMonth,
      'month-cell--today': day.isToday,
      'month-cell--selected': selected,
    }"
    @click="$emit('select', day)"
  >
    <span class="month-cell__num">{{ dayNumber }}</span>
    <span class="month-cell__marks">
      <span
        v-for="session in dots"
        :key="session.subjectId"
        class="month-cell__dot"
        :style="{ background: session.color }"
      />
      <span v-if="hasActivity" class="month-cell__star">✦</span>
    </span>
  </button>
</template>

<style scoped>
.month-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  min-height: 44px;
  padding: 5px 2px;
  border: var(--pt-stroke) solid transparent;
  border-radius: var(--pt-radius-sm);
  background: transparent;
  font-family: inherit;
  cursor: pointer;
}
.month-cell--muted {
  opacity: 0.35;
}
.month-cell--today .month-cell__num {
  font-weight: 800;
  color: var(--pt-ink);
}
.month-cell--selected {
  border-color: var(--pt-ink);
  background: var(--pt-card);
}
.month-cell__num {
  font-size: calc(13px * var(--pt-text-scale));
  font-variant-numeric: tabular-nums;
}
.month-cell__marks {
  display: flex;
  align-items: center;
  gap: 3px;
  min-height: 8px;
}
.month-cell__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.month-cell__star {
  font-size: calc(9px * var(--pt-text-scale));
  line-height: 1;
  color: var(--pt-accent, var(--pt-ink-soft));
}
</style>
