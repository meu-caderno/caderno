<script setup lang="ts">
import type { Activity, Subject } from "@meu-caderno/core";
import type { SubjectStats } from "~/composables/useCaderno";

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

function subjectName(id?: string) {
  return props.subjects.find((subject) => subject.id === id)?.name;
}
function subjectColor(id?: string) {
  return props.stats.find((stat) => stat.subject.id === id)?.status.color;
}
</script>

<template>
  <section class="block">
    <div class="block__head">
      <h2 class="pt-hand block__title">Atividades</h2>
      <span class="block__count">{{ activities.length }} pendentes</span>
    </div>
    <div class="activities-section__list">
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
.activities-section__list {
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.activities-section__add {
  margin-top: 4px;
}
</style>
