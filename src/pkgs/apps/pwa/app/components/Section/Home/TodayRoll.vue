<script setup lang="ts">
import type { AttendanceStatus } from "@meu-caderno/core";
import type { TodayClass } from "~/composables/useCaderno";

defineProps<{ roll: TodayClass[]; dateLabel: string }>();
const emit = defineEmits<{
  mark: [subjectId: string, status: AttendanceStatus];
}>();
</script>

<template>
  <section class="block">
    <div class="block__head">
      <h2 class="pt-hand block__title">Chamada de hoje</h2>
      <span class="block__date">{{ dateLabel }}</span>
    </div>

    <div v-if="roll.length" class="today-roll">
      <SectionHomeRollItem
        v-for="item in roll"
        :key="item.subject.id"
        :item="item"
        @mark="emit('mark', item.subject.id, $event)"
      />
    </div>
    <UIEmptyState
      v-else
      icon="🌤"
      title="Nenhuma aula hoje"
      subtitle="Aproveite para adiantar uma atividade ou descansar."
    />
  </section>
</template>

<style scoped>
.today-roll {
  display: flex;
  flex-direction: column;
  gap: 11px;
}
</style>
