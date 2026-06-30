<script setup lang="ts">
import type { Schedule, Subject, TimeBlock } from "@meu-caderno/core";
import { ScheduleKind } from "@meu-caderno/core";
import type { TimetableLesson } from "./TimetableCell.vue";

interface ScheduledSubject {
  id: string;
  name: string;
  color: string;
  schedule: Schedule;
}

interface GridSubject {
  id: string;
  name: string;
  color: string;
  weekdays: Set<number>;
  slotKeys: Set<string>;
}

interface Column {
  weekday: number;
  label: string;
}

interface TimeSlot {
  key: string;
  start: string;
  end: string;
}

interface TimeRow extends TimeSlot {
  cells: TimetableLesson[][];
}

interface OffGridSubject {
  subjectId: string;
  name: string;
  color: string;
  reason: string;
}

interface TimetableModel {
  columns: Column[];
  rows: TimeRow[];
  offGrid: OffGridSubject[];
}

const WEEKDAY_LABELS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
const BASE_WEEKDAYS = new Set([1, 2, 3, 4, 5]);
const RECURRING_KINDS = new Set([ScheduleKind.WEEKLY, ScheduleKind.AB_WEEKS]);

function slotKey(block: TimeBlock): string {
  return `${block.start}–${block.end}`;
}

function isGridSchedule(schedule: Schedule): boolean {
  const hasWeekdays = (schedule.weekdays?.length ?? 0) > 0;
  const hasBlocks = (schedule.blocks?.length ?? 0) > 0;
  return RECURRING_KINDS.has(schedule.kind) && hasWeekdays && hasBlocks;
}

function offGridReason(schedule: Schedule): string {
  if (schedule.kind === ScheduleKind.ROTATING_CYCLE) return "ciclo rotativo";
  if (schedule.kind === ScheduleKind.BLOCK_INTENSIVE) return "intensivo";
  if (schedule.kind === ScheduleKind.AD_HOC) return "datas avulsas";
  if ((schedule.weekdays?.length ?? 0) === 0) return "sem dia fixo";
  return "sem horário";
}

function toScheduled(subjects: Subject[]): ScheduledSubject[] {
  return subjects
    .filter(
      (subject): subject is Subject & { schedule: Schedule } =>
        subject.schedule != null,
    )
    .map((subject) => ({
      id: subject.id,
      name: subject.name,
      color: subject.color,
      schedule: subject.schedule,
    }));
}

function toGridSubject(subject: ScheduledSubject): GridSubject {
  return {
    id: subject.id,
    name: subject.name,
    color: subject.color,
    weekdays: new Set(subject.schedule.weekdays ?? []),
    slotKeys: new Set((subject.schedule.blocks ?? []).map(slotKey)),
  };
}

function toOffGrid(subject: ScheduledSubject): OffGridSubject {
  return {
    subjectId: subject.id,
    name: subject.name,
    color: subject.color,
    reason: offGridReason(subject.schedule),
  };
}

function buildColumns(weekdaysUsed: Set<number>): Column[] {
  return WEEK_ORDER.filter(
    (weekday) => BASE_WEEKDAYS.has(weekday) || weekdaysUsed.has(weekday),
  ).map((weekday) => ({ weekday, label: WEEKDAY_LABELS[weekday] ?? "" }));
}

function collectSlots(subjects: ScheduledSubject[]): TimeSlot[] {
  const slots = new Map<string, TimeSlot>();
  for (const subject of subjects) {
    for (const block of subject.schedule.blocks ?? []) {
      const key = slotKey(block);
      if (!slots.has(key)) {
        slots.set(key, { key, start: block.start, end: block.end });
      }
    }
  }
  return [...slots.values()].sort((left, right) =>
    left.start.localeCompare(right.start),
  );
}

function lessonsAt(
  subjects: GridSubject[],
  weekday: number,
  key: string,
): TimetableLesson[] {
  return subjects
    .filter(
      (subject) => subject.weekdays.has(weekday) && subject.slotKeys.has(key),
    )
    .map((subject) => ({
      subjectId: subject.id,
      name: subject.name,
      color: subject.color,
    }));
}

function buildRows(
  subjects: GridSubject[],
  slots: TimeSlot[],
  columns: Column[],
): TimeRow[] {
  return slots.map((slot) => ({
    ...slot,
    cells: columns.map((column) =>
      lessonsAt(subjects, column.weekday, slot.key),
    ),
  }));
}

function buildModel(subjects: Subject[]): TimetableModel {
  const scheduled = toScheduled(subjects);
  const gridSource = scheduled.filter((subject) =>
    isGridSchedule(subject.schedule),
  );
  const gridSubjects = gridSource.map(toGridSubject);
  const weekdaysUsed = new Set(
    gridSubjects.flatMap((subject) => [...subject.weekdays]),
  );
  const columns = buildColumns(weekdaysUsed);
  return {
    columns,
    rows: buildRows(gridSubjects, collectSlots(gridSource), columns),
    offGrid: scheduled
      .filter((subject) => !isGridSchedule(subject.schedule))
      .map(toOffGrid),
  };
}

const { subjects } = useCaderno();
const model = computed(() => buildModel(subjects.value));
const isEmpty = computed(
  () => model.value.rows.length === 0 && model.value.offGrid.length === 0,
);
const gridStyle = computed(() => ({
  gridTemplateColumns: `auto repeat(${model.value.columns.length}, minmax(0, 1fr))`,
}));
</script>

<template>
  <section class="timetable">
    <UIEmptyState
      v-if="isEmpty"
      icon="🗓️"
      title="Sem horário fixo"
      subtitle="Defina dias e blocos de horário nas disciplinas para montar a grade."
    />

    <template v-else>
      <div v-if="model.rows.length" class="timetable__grid" :style="gridStyle">
        <span class="timetable__corner" />
        <span
          v-for="column in model.columns"
          :key="column.weekday"
          class="timetable__head"
        >
          {{ column.label }}
        </span>

        <template v-for="row in model.rows" :key="row.key">
          <span class="timetable__time">
            <strong>{{ row.start }}</strong>
            <span>{{ row.end }}</span>
          </span>
          <SectionAgendaTimetableCell
            v-for="(lessons, index) in row.cells"
            :key="`${row.key}-${model.columns[index]?.weekday}`"
            :lessons="lessons"
          />
        </template>
      </div>

      <section v-if="model.offGrid.length" class="timetable__off">
        <h3 class="timetable__off-title">fora da grade semanal</h3>
        <div class="timetable__off-list">
          <UIBadge
            v-for="item in model.offGrid"
            :key="item.subjectId"
            tone="custom"
            :color="item.color"
            dot
            bordered
          >
            {{ item.name }}
            <span class="timetable__off-reason">· {{ item.reason }}</span>
          </UIBadge>
        </div>
      </section>
    </template>
  </section>
</template>

<style scoped>
.timetable {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.timetable__grid {
  display: grid;
  gap: 2px;
  overflow-x: auto;
}
.timetable__corner {
  position: sticky;
  left: 0;
}
.timetable__head {
  text-align: center;
  font-size: calc(11px * var(--pt-text-scale));
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--pt-ink-muted);
  padding: 4px 0;
}
.timetable__time {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
  padding: 4px 8px;
  min-width: 48px;
  font-size: calc(11px * var(--pt-text-scale));
  font-variant-numeric: tabular-nums;
  color: var(--pt-ink-muted);
}
.timetable__time strong {
  color: var(--pt-ink);
}
.timetable__off {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.timetable__off-title {
  margin: 0;
  font-size: calc(12px * var(--pt-text-scale));
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--pt-ink-muted);
}
.timetable__off-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.timetable__off-reason {
  opacity: 0.7;
}
</style>
