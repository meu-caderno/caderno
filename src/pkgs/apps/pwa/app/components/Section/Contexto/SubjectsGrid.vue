<script setup lang="ts">
import type { Id } from "@meu-caderno/core";
import type { SubjectStats } from "~/utils/caderno-stats";

defineProps<{ stats: SubjectStats[] }>();
const emit = defineEmits<{ notas: [Id]; detail: [Id] }>();
</script>

<template>
  <section class="block subjects-grid">
    <div class="block__head">
      <h2 class="pt-hand block__title">Disciplinas</h2>
      <span class="block__count">{{ stats.length }}</span>
    </div>

    <p v-if="!stats.length" class="subjects-grid__empty">
      Nenhuma disciplina neste contexto ainda.
    </p>
    <div v-else class="subjects-grid__grid">
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
.subjects-grid__empty {
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  margin: 0;
}
.subjects-grid__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 13px;
}
@container (min-width: 640px) {
  .subjects-grid__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
