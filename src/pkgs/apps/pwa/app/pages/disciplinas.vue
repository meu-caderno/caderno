<script setup lang="ts">
import type { Id } from "@meu-caderno/core";
import type { SubjectStats } from "~/utils/caderno-stats";

const { groups, totalSubjects } = useSubjects();

const detailSubjectId = ref<Id | null>(null);
const notasSubjectId = ref<Id | null>(null);

const allStats = computed<SubjectStats[]>(() =>
  groups.value.flatMap((group) => group.stats),
);

function statById(id: Id | null): SubjectStats | null {
  if (!id) return null;
  return allStats.value.find((stat) => stat.subject.id === id) ?? null;
}

const detailStat = computed(() => statById(detailSubjectId.value));
const notasSubject = computed(
  () => statById(notasSubjectId.value)?.subject ?? null,
);

function openNotas() {
  notasSubjectId.value = detailStat.value?.subject.id ?? null;
}
</script>

<template>
  <div class="disciplinas">
    <SectionPageHeader
      title="Disciplinas"
      :subtitle="`${totalSubjects} disciplinas`"
    />

    <UIEmptyState
      v-if="!totalSubjects"
      icon="📚"
      title="Nenhuma disciplina ainda"
      subtitle="Adicione suas matérias para acompanhar presença e notas."
    />

    <section
      v-for="group in groups"
      v-else
      :key="group.context.id"
      class="disciplinas__group"
    >
      <h2 class="pt-hand disciplinas__group-title">{{ group.context.name }}</h2>
      <div class="disciplinas__grid">
        <SectionHomeSubjectCard
          v-for="stat in group.stats"
          :key="stat.subject.id"
          :stat="stat"
          @notas="notasSubjectId = stat.subject.id"
          @detail="detailSubjectId = stat.subject.id"
        />
      </div>
    </section>

    <SectionHomeSubjectDetail
      v-if="detailStat"
      :stat="detailStat"
      @close="detailSubjectId = null"
      @notas="openNotas"
      @edit="detailSubjectId = null"
      @delete="detailSubjectId = null"
    />
    <SectionHomeAssessments
      v-if="notasSubject"
      :subject="notasSubject"
      @close="notasSubjectId = null"
    />
  </div>
</template>

<style scoped>
.disciplinas {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--pt-pad-screen) 16px 64px;
  display: flex;
  flex-direction: column;
  gap: calc(16px * var(--pt-density));
  container-type: inline-size;
}
.disciplinas__group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.disciplinas__group-title {
  font-size: calc(18px * var(--pt-text-scale));
  font-weight: 700;
  margin: 0;
}
.disciplinas__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 13px;
}
@container (min-width: 640px) {
  .disciplinas__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
