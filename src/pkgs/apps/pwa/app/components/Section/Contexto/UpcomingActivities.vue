<script setup lang="ts">
import type { Activity, Id, Subject } from "@meu-caderno/core";

const props = defineProps<{
  activities: Activity[];
  subjects: Subject[];
  today: string;
}>();
const emit = defineEmits<{ complete: [Activity]; edit: [Activity] }>();

const subjectById = computed(
  () => new Map(props.subjects.map((subject) => [subject.id, subject])),
);
function subjectOf(id: Id | undefined): Subject | undefined {
  return id ? subjectById.value.get(id) : undefined;
}
</script>

<template>
  <section class="block upcoming">
    <div class="block__head">
      <h2 class="pt-hand block__title">Próximas atividades</h2>
      <span class="block__count">{{ activities.length }}</span>
    </div>

    <p v-if="!activities.length" class="upcoming__empty">
      Nada pendente por aqui ✦
    </p>
    <div v-else class="upcoming__list">
      <SectionHomeActivityItem
        v-for="activity in activities"
        :key="activity.id"
        :activity="activity"
        :subject-name="subjectOf(activity.subjectId)?.name"
        :subject-color="subjectOf(activity.subjectId)?.color"
        :today="today"
        @complete="emit('complete', activity)"
        @edit="emit('edit', activity)"
      />
    </div>
  </section>
</template>

<style scoped>
.upcoming__empty {
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  margin: 0;
}
.upcoming__list {
  display: flex;
  flex-direction: column;
  gap: 9px;
}
</style>
