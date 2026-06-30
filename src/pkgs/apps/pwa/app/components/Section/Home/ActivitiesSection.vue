<script setup lang="ts">
import type { Activity, Subject } from "@meu-caderno/core";
import { useTheme } from "~/composables/useTheme";
import type { SubjectStats } from "~/utils/caderno-stats";

const props = defineProps<{
  activities: Activity[];
  subjects: Subject[];
  stats: SubjectStats[];
  today: string;
}>();
const emit = defineEmits<{
  complete: [activity: Activity];
  create: [];
  edit: [activity: Activity];
}>();

const { activityView, setActivityView } = useTheme();
const isBoard = computed(() => activityView.value === "board");

function subjectName(id?: string) {
  return props.subjects.find((subject) => subject.id === id)?.name;
}
function subjectColor(id?: string) {
  return props.stats.find((stat) => stat.subject.id === id)?.status.color;
}
</script>

<template>
  <section class="block activities-section">
    <div class="block__head">
      <h2 class="pt-hand block__title">Atividades</h2>
      <div class="activities-section__head-right">
        <span class="block__count">{{ activities.length }} pendentes</span>
        <div class="activities-section__view">
          <button
            type="button"
            class="activities-section__view-btn"
            :class="{ 'activities-section__view-btn--on': !isBoard }"
            aria-label="Ver em lista"
            @click="setActivityView('list')"
          >
            <UIIcon icon="list" :size="15" />
          </button>
          <button
            type="button"
            class="activities-section__view-btn"
            :class="{ 'activities-section__view-btn--on': isBoard }"
            aria-label="Ver em board"
            @click="setActivityView('board')"
          >
            <UIIcon icon="filter" :size="15" />
          </button>
        </div>
      </div>
    </div>
    <SectionHomeActivityBoard
      v-if="isBoard"
      :activities="activities"
      :subjects="subjects"
      :stats="stats"
      :today="today"
      @complete="emit('complete', $event)"
      @edit="emit('edit', $event)"
    />
    <div v-else class="activities-section__list">
      <SectionHomeActivityItem
        v-for="activity in activities"
        :key="activity.id"
        :activity="activity"
        :subject-name="subjectName(activity.subjectId)"
        :subject-color="subjectColor(activity.subjectId)"
        :today="today"
        @complete="emit('complete', activity)"
        @edit="emit('edit', activity)"
      />
    </div>
    <UIButton
      variant="fantasma"
      full
      icon="plus"
      label="Capturar atividade"
      class="activities-section__add"
      @click="emit('create')"
    />
  </section>
</template>

<style scoped>
.activities-section {
  container-type: inline-size;
}
.activities-section__head-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.activities-section__view {
  display: inline-flex;
  gap: 2px;
  padding: 2px;
  border-radius: var(--pt-radius-sm);
  background: var(--pt-card);
  border: 1.5px solid var(--pt-border-muted);
}
.activities-section__view-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 24px;
  border: none;
  border-radius: 6px;
  background: none;
  color: var(--pt-ink-muted);
  cursor: pointer;
}
.activities-section__view-btn--on {
  background: var(--pt-paper);
  color: var(--pt-accent);
}
.activities-section__list {
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.activities-section__add {
  margin-top: 4px;
}
</style>
