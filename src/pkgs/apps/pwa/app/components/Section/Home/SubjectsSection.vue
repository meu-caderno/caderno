<script setup lang="ts">
import type { Id } from "@meu-caderno/core";
import type { SubjectStats } from "~/composables/useCaderno";

defineProps<{ stats: SubjectStats[] }>();
const emit = defineEmits<{
  create: [];
  notas: [subjectId: Id];
  detail: [subjectId: Id];
}>();
</script>

<template>
  <section class="block subjects-section">
    <div class="block__head">
      <h2 class="pt-hand block__title">Disciplinas</h2>
      <UIButton
        variant="fantasma"
        icon="plus"
        label="Nova"
        @click="emit('create')"
      />
    </div>
    <UIEmptyState
      v-if="!stats.length"
      icon="📚"
      title="Nenhuma disciplina ainda"
      subtitle="Adicione suas matérias para acompanhar presença e notas."
      action-label="Nova disciplina"
      @action="emit('create')"
    />
    <div v-else class="subjects-section__grid">
      <SectionHomeSubjectCard
        v-for="stat in stats"
        :key="stat.subject.id"
        :stat="stat"
        @notas="emit('notas', stat.subject.id)"
        @detail="emit('detail', stat.subject.id)"
      />
    </div>
  </section>
</template>

<style scoped>
.subjects-section {
  container-type: inline-size;
}
.subjects-section__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 13px;
}
@container (min-width: 640px) {
  .subjects-section__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
