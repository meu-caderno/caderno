<script setup lang="ts">
import type { Activity } from "@meu-caderno/core";
import { ActivityKind, Recurrence } from "@meu-caderno/core";
import { daysFromToday, formatDay } from "~/composables/useCaderno";

type DueTone = "perigo" | "atencao" | "neutro";

interface DueBadgeView {
  label: string;
  tone: DueTone;
}

const props = defineProps<{
  activity: Activity;
  subjectName?: string;
  subjectColor?: string;
  today: string;
}>();
const emit = defineEmits<{ complete: []; edit: [] }>();

const kindIcon: Record<ActivityKind, string> = {
  [ActivityKind.EXAM]: "📝",
  [ActivityKind.ASSIGNMENT]: "📤",
  [ActivityKind.READING]: "📖",
  [ActivityKind.TASK]: "✅",
  [ActivityKind.CAPTURE]: "📥",
};

const doneSubtasks = computed(
  () => props.activity.subtasks?.filter((task) => task.done).length ?? 0,
);
const repeats = computed(
  () =>
    props.activity.recurrence != null &&
    props.activity.recurrence !== Recurrence.NONE,
);

function dueBadge(date: string | undefined): DueBadgeView {
  if (!date) return { label: "inbox", tone: "neutro" };
  const days = daysFromToday(date, props.today);
  if (days < 0) return { label: `${-days}d atrás`, tone: "perigo" };
  if (days === 0) return { label: "hoje", tone: "perigo" };
  if (days === 1) return { label: "amanhã", tone: "atencao" };
  if (days <= 3) return { label: `em ${days}d`, tone: "atencao" };
  return { label: formatDay(date), tone: "neutro" };
}

const due = computed(() => dueBadge(props.activity.dueDate));
</script>

<template>
  <UICard pad="12px 14px" flat class="activity-item">
    <button
      class="activity-item__check"
      aria-label="Concluir atividade"
      @click="emit('complete')"
    >
      <UIIcon icon="check" :size="13" />
    </button>
    <span class="activity-item__kind">{{ kindIcon[activity.kind] ?? "•" }}</span>
    <button type="button" class="activity-item__body" @click="emit('edit')">
      <div class="activity-item__title">{{ activity.title }}</div>
      <div class="activity-item__sub">
        <span
          v-if="subjectName"
          class="activity-item__dot"
          :style="{ background: subjectColor ?? '#c4beb0' }"
        />
        <span v-if="subjectName" class="activity-item__subject">
          {{ subjectName }}
        </span>
        <span v-if="activity.subtasks?.length" class="activity-item__subtasks">
          {{ doneSubtasks }}/{{ activity.subtasks.length }} subtarefas
        </span>
        <span v-if="repeats" class="activity-item__repeat">🔁</span>
      </div>
    </button>
    <UIBadge :tone="due.tone" size="md" :label="due.label" />
  </UICard>
</template>

<style scoped>
.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.activity-item__check {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: transparent;
  cursor: pointer;
  transition: all 0.12s;
}
.activity-item__check:hover {
  border-color: var(--pt-ok);
  color: var(--pt-ok);
}
.activity-item__kind {
  font-size: calc(18px * var(--pt-text-scale));
  line-height: 1;
  flex-shrink: 0;
}
.activity-item__body {
  flex: 1;
  min-width: 0;
  text-align: left;
  font-family: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}
.activity-item__title {
  font-size: calc(14px * var(--pt-text-scale));
  font-weight: 600;
}
.activity-item__sub {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 2px;
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
.activity-item__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.activity-item__subtasks::before {
  content: "·";
  margin-right: 7px;
}
</style>
