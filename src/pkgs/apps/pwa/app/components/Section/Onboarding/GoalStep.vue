<script setup lang="ts">
import { Goal } from "@meu-caderno/core";

const goals = defineModel<string[]>("goals", { default: () => [] });
const emit = defineEmits<{ next: []; back: [] }>();

const options = [
  { value: Goal.UNIVERSITY, label: "🎓 Faculdade" },
  { value: Goal.PUBLIC_EXAM, label: "📚 Concurso / ENEM" },
  { value: Goal.OPEN_COURSE, label: "🧩 Curso livre" },
  { value: Goal.FREE_STUDY, label: "🌱 Estudo livre" },
];
</script>

<template>
  <div class="goal-step">
    <h2 class="pt-hand goal-step__title">Pra que você vai usar?</h2>
    <p class="goal-step__sub">
      Escolha um ou mais — o app liga só o que faz sentido. Dá pra mudar depois.
    </p>
    <UIToggleGroup
      v-model="goals"
      :options="options"
      multiple
      class="goal-step__options"
    />
    <UIButton
      variant="primal"
      full
      label="Continuar"
      :disabled="!goals.length"
      @click="emit('next')"
    />
  </div>
</template>

<style scoped>
.goal-step__title {
  font-size: calc(26px * var(--pt-text-scale));
  font-weight: 700;
  margin: 0 0 6px;
}
.goal-step__sub {
  font-size: calc(14px * var(--pt-text-scale));
  line-height: 1.5;
  color: var(--pt-ink-muted);
  margin: 0 0 18px;
}
.goal-step__options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 22px;
}
.goal-step__options :deep(.uitg__item) {
  justify-content: center;
  padding: 14px 10px;
}
</style>
