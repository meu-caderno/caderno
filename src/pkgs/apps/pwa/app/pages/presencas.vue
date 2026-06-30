<script setup lang="ts">
import { formatDay } from "~/utils/caderno-stats";
import {
  attendanceVisual,
  type PresenceFilter,
  type PresenceGrouping,
  type PresenceRow,
} from "~/utils/presences";

interface ChipOption<T> {
  value: T;
  label: string;
}

interface DisplayRow {
  id: string;
  icon: string;
  color: string;
  status: string;
  subject: string;
  date: string;
}

interface DisplayGroup {
  key: string;
  label: string;
  rows: DisplayRow[];
}

const { rows, filterRecords, groupRecords } = usePresences();

const filter = ref<PresenceFilter>("all");
const grouping = ref<PresenceGrouping>("date");

const filterOptions: ChipOption<PresenceFilter>[] = [
  { value: "all", label: "Tudo" },
  { value: "misses", label: "Faltas & atrasos" },
  { value: "present", label: "Presenças" },
];
const groupOptions: ChipOption<PresenceGrouping>[] = [
  { value: "date", label: "Por data" },
  { value: "subject", label: "Por disciplina" },
  { value: "status", label: "Por situação" },
];

const filtered = computed(() => filterRecords(rows.value, filter.value));

function toDisplayRow(row: PresenceRow): DisplayRow {
  const visual = attendanceVisual(row.record.status);
  return {
    id: row.record.id,
    icon: visual.icon,
    color: visual.color,
    status: visual.label,
    subject: row.subject.name,
    date: formatDay(row.record.day),
  };
}

const groups = computed<DisplayGroup[]>(() =>
  groupRecords(filtered.value, grouping.value).map((group) => ({
    key: group.key,
    label: group.label,
    rows: group.rows.map(toDisplayRow),
  })),
);

const subtitle = computed(() => `${filtered.value.length} registros`);
</script>

<template>
  <div class="presencas">
    <SectionPageHeader title="Presenças & Faltas" :subtitle="subtitle" />

    <div class="presencas__filters">
      <div class="presencas__chips">
        <UIChip
          v-for="option in filterOptions"
          :key="option.value"
          :label="option.label"
          :selected="filter === option.value"
          @click="filter = option.value"
        />
      </div>
      <div class="presencas__chips">
        <UIChip
          v-for="option in groupOptions"
          :key="option.value"
          :label="option.label"
          :selected="grouping === option.value"
          @click="grouping = option.value"
        />
      </div>
    </div>

    <UIEmptyState
      v-if="!groups.length"
      icon="🗓️"
      title="Sem registros"
      subtitle="Marque presenças nas suas disciplinas para acompanhar o histórico aqui."
    />

    <section
      v-for="group in groups"
      v-else
      :key="group.key"
      class="presencas__group"
    >
      <h2 class="pt-hand presencas__group-title">{{ group.label }}</h2>
      <div class="presencas__rows">
        <div
          v-for="row in group.rows"
          :key="row.id"
          class="presencas__row"
        >
          <span class="presencas__glyph">{{ row.icon }}</span>
          <div class="presencas__info">
            <span class="presencas__subject">{{ row.subject }}</span>
            <span class="presencas__date">{{ row.date }}</span>
          </div>
          <UIBadge
            tone="custom"
            :color="row.color"
            :label="row.status"
            dot
          />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.presencas {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--pt-pad-screen) 16px 64px;
  display: flex;
  flex-direction: column;
  gap: calc(16px * var(--pt-density));
  container-type: inline-size;
}
.presencas__filters {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.presencas__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.presencas__group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.presencas__group-title {
  font-size: calc(16px * var(--pt-text-scale));
  font-weight: 700;
  margin: 0;
  text-transform: capitalize;
}
.presencas__rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.presencas__row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--pt-radius-sm);
  border: var(--pt-stroke) solid var(--pt-border-muted);
  background: var(--pt-card);
}
.presencas__glyph {
  font-size: calc(18px * var(--pt-text-scale));
  line-height: 1;
}
.presencas__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}
.presencas__subject {
  font-size: calc(14px * var(--pt-text-scale));
  font-weight: 600;
  color: var(--pt-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.presencas__date {
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
</style>
