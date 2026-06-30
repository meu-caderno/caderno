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
  <div class="day-pills">
    <UIBadge
      v-for="session in day.sessions"
      :key="session.subjectId"
      tone="custom"
      :color="session.color"
      dot
      bordered
    >
      <span class="day-pills__name">{{ session.name }}</span>
      <span v-if="timeLabel(session.blocks)" class="day-pills__time">
        {{ timeLabel(session.blocks) }}
      </span>
    </UIBadge>

    <UIBadge
      v-for="activity in day.activities"
      :key="activity.id"
      tone="info"
      bordered
    >
      {{ kindIcon[activity.kind] ?? "•" }} {{ activity.title }}
    </UIBadge>

    <span
      v-if="!day.sessions.length && !day.activities.length"
      class="day-pills__empty"
    >
      sem aulas nem entregas
    </span>
  </div>
</template>

<style scoped>
.day-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.day-pills__time {
  font-variant-numeric: tabular-nums;
  opacity: 0.75;
}
.day-pills__empty {
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
</style>
