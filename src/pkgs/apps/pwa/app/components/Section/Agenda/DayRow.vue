<script setup lang="ts">
import type { TimeBlock } from "@meu-caderno/core";
import { ActivityKind } from "@meu-caderno/core";
import type { AgendaDay } from "~/composables/useAgenda";

defineProps<{ day: AgendaDay }>();

const kindIcon: Record<ActivityKind, string> = {
  [ActivityKind.EXAM]: "📝",
  [ActivityKind.ASSIGNMENT]: "📤",
  [ActivityKind.READING]: "📖",
  [ActivityKind.TASK]: "✅",
  [ActivityKind.CAPTURE]: "📥",
};

function timeLabel(blocks: TimeBlock[]): string {
  const first = blocks[0];
  return first ? `${first.start}–${first.end}` : "";
}
</script>

<template>
  <section class="day-row" :class="{ 'day-row--today': day.isToday }">
    <header class="day-row__head">
      <span class="day-row__weekday">{{ day.weekdayLabel }}</span>
      <span class="day-row__date">{{ day.dayLabel }}</span>
      <span v-if="day.isToday" class="day-row__today">hoje</span>
    </header>

    <div
      v-if="!day.sessions.length && !day.activities.length"
      class="day-row__empty"
    >
      sem aulas nem entregas
    </div>

    <div v-else class="day-row__items">
      <div
        v-for="session in day.sessions"
        :key="session.subjectId"
        class="day-row__item"
      >
        <span class="day-row__dot" :style="{ background: session.color }" />
        <span class="day-row__name">{{ session.name }}</span>
        <span class="day-row__time">{{ timeLabel(session.blocks) }}</span>
      </div>
      <div
        v-for="activity in day.activities"
        :key="activity.id"
        class="day-row__item day-row__item--activity"
      >
        <span class="day-row__kind">{{ kindIcon[activity.kind] ?? "•" }}</span>
        <span class="day-row__name">{{ activity.title }}</span>
        <span class="day-row__time">entrega</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.day-row {
  padding: 12px 14px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
}
.day-row--today {
  border-color: var(--pt-ink);
}
.day-row__head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
}
.day-row__weekday {
  font-weight: 700;
  text-transform: uppercase;
  font-size: calc(12px * var(--pt-text-scale));
  letter-spacing: 0.04em;
}
.day-row__date {
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
.day-row__today {
  margin-left: auto;
  font-size: calc(11px * var(--pt-text-scale));
  font-weight: 700;
  color: var(--pt-ink);
}
.day-row__empty {
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
.day-row__items {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.day-row__item {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: calc(14px * var(--pt-text-scale));
}
.day-row__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}
.day-row__kind {
  font-size: calc(15px * var(--pt-text-scale));
  line-height: 1;
  flex-shrink: 0;
}
.day-row__name {
  flex: 1;
  font-weight: 600;
  min-width: 0;
}
.day-row__time {
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  font-variant-numeric: tabular-nums;
}
.day-row__item--activity .day-row__time {
  color: var(--pt-accent, var(--pt-ink-soft));
}
</style>
