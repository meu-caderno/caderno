<script setup lang="ts">
import type { Activity, DayIso, Subject } from "@meu-caderno/core";
import { DueBucket, groupByDue } from "@meu-caderno/core";
import type { SubjectStats } from "~/utils/caderno-stats";

const props = defineProps<{
  activities: Activity[];
  subjects: Subject[];
  stats: SubjectStats[];
  today: string;
}>();
const emit = defineEmits<{
  complete: [activity: Activity];
  edit: [activity: Activity];
}>();

const COLUMNS: { bucket: DueBucket; label: string }[] = [
  { bucket: DueBucket.OVERDUE, label: "Atrasadas" },
  { bucket: DueBucket.TODAY, label: "Hoje" },
  { bucket: DueBucket.SOON, label: "Em breve" },
  { bucket: DueBucket.LATER, label: "Depois" },
  { bucket: DueBucket.NONE, label: "Sem data" },
];

const grouped = computed(() =>
  groupByDue(props.activities, props.today as DayIso),
);
const columns = computed(() =>
  COLUMNS.map((column) => ({
    ...column,
    items: grouped.value[column.bucket] ?? [],
  })).filter((column) => column.items.length > 0),
);

function subjectName(id?: string) {
  return props.subjects.find((subject) => subject.id === id)?.name;
}
function subjectColor(id?: string) {
  return props.stats.find((stat) => stat.subject.id === id)?.status.color;
}
</script>

<template>
  <div class="activity-board">
    <div v-for="column in columns" :key="column.bucket" class="activity-board__col">
      <div class="activity-board__col-head">
        <span class="activity-board__col-title">{{ column.label }}</span>
        <span class="activity-board__col-count">{{ column.items.length }}</span>
      </div>
      <SectionHomeActivityItem
        v-for="activity in column.items"
        :key="activity.id"
        :activity="activity"
        :subject-name="subjectName(activity.subjectId)"
        :subject-color="subjectColor(activity.subjectId)"
        :today="today"
        @complete="emit('complete', activity)"
        @edit="emit('edit', activity)"
      />
    </div>
  </div>
</template>

<style scoped>
.activity-board {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@container (min-width: 640px) {
  .activity-board {
    grid-template-columns: repeat(2, 1fr);
  }
}
.activity-board__col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.activity-board__col-head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.activity-board__col-title {
  font-size: calc(12px * var(--pt-text-scale));
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--pt-ink-muted);
}
.activity-board__col-count {
  font-size: calc(11px * var(--pt-text-scale));
  font-weight: 700;
  color: var(--pt-ink-muted);
  background: var(--pt-card);
  padding: 1px 7px;
  border-radius: var(--pt-radius-pill);
}
</style>
