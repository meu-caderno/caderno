<script setup lang="ts">
import type { Grade, Id, Subject } from "@meu-caderno/core";
import { weightedAverage, weightsBalanced } from "@meu-caderno/core";

const props = defineProps<{ subject: Subject }>();
const emit = defineEmits<{ close: [] }>();

const { service } = useCadernoService();

const assessments = computed(() => props.subject.assessments ?? []);
const balanced = computed(() => weightsBalanced(assessments.value));
const totalPct = computed(() =>
  Math.round(
    assessments.value.reduce((sum, assessment) => sum + assessment.weight, 0) *
      100,
  ),
);
const average = computed(() => weightedAverage(assessments.value));

const name = ref("");
const weight = ref<number | null>(null);
const grade = ref<number | null>(null);
const adding = ref(false);

async function add() {
  const trimmedName = name.value.trim();
  if (!trimmedName || weight.value == null || adding.value) return;
  adding.value = true;
  await service.addAssessment(props.subject.id, {
    name: trimmedName,
    weight: weight.value / 100,
    grade: grade.value != null ? (grade.value as Grade) : undefined,
  });
  adding.value = false;
  name.value = "";
  weight.value = null;
  grade.value = null;
}

function onGrade(id: Id, event: Event) {
  const value = (event.target as HTMLInputElement).value;
  if (value === "") return;
  void service.setGrade(props.subject.id, id, Number(value) as Grade);
}
</script>

<template>
  <UIModal
    title="Notas & avaliações"
    :subtitle="subject.name"
    @close="emit('close')"
  >
    <div class="as">
      <div class="as__summary">
        <div>
          <span class="as__avg-l">média parcial</span>
          <span class="as__avg-v">{{ average != null ? average.toFixed(1) : "—" }}</span>
        </div>
        <UIBadge
          v-if="assessments.length && !balanced"
          tone="atencao"
          size="md"
          :label="`pesos somam ${totalPct}% (ideal 100%)`"
        />
      </div>

      <div v-if="assessments.length" class="as__list">
        <div v-for="assessment in assessments" :key="assessment.id" class="as__item">
          <div class="as__item-info">
            <span class="as__item-name">{{ assessment.name }}</span>
            <span class="as__item-weight">peso {{ Math.round(assessment.weight * 100) }}%</span>
          </div>
          <input
            class="as__grade"
            type="number"
            min="0"
            max="10"
            step="0.1"
            :value="assessment.grade ?? ''"
            placeholder="nota"
            @change="onGrade(assessment.id, $event)"
          />
        </div>
      </div>
      <UIEmptyState
        v-else
        icon="🧮"
        title="Sem avaliações"
        subtitle="Adicione provas e trabalhos com peso para ver a média e quanto precisa pra passar."
      />

      <div class="as__add">
        <input
          v-model="name"
          class="as__input as__input--name"
          type="text"
          placeholder="Nome da avaliação"
        />
        <input
          v-model.number="weight"
          class="as__input as__input--num"
          type="number"
          min="0"
          max="100"
          placeholder="peso %"
        />
        <input
          v-model.number="grade"
          class="as__input as__input--num"
          type="number"
          min="0"
          max="10"
          step="0.1"
          placeholder="nota"
        />
        <UIButton
          variant="primal"
          icon="plus"
          aria-label="Adicionar avaliação"
          @click="add"
        />
      </div>
      <span class="as__hint">
        Deixe a nota em branco se a avaliação ainda não aconteceu — ela entra como
        "o que falta".
      </span>
    </div>
  </UIModal>
</template>

<style scoped>
.as {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.as__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.as__avg-l {
  font-size: calc(12px * var(--pt-text-scale));
  font-weight: 600;
  color: var(--pt-ink-muted);
}
.as__avg-v {
  font-size: calc(24px * var(--pt-text-scale));
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  margin-left: 8px;
}
.as__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.as__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 1.5px solid var(--pt-border-muted);
  border-radius: var(--pt-radius-sm);
  background: var(--pt-card);
}
.as__item-info {
  flex: 1;
  min-width: 0;
}
.as__item-name {
  font-size: calc(14px * var(--pt-text-scale));
  font-weight: 600;
}
.as__item-weight {
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  margin-left: 8px;
}
.as__grade {
  width: 64px;
  text-align: center;
  font-family: inherit;
  font-size: calc(15px * var(--pt-text-scale));
  padding: 7px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-paper);
  color: var(--pt-ink);
}
.as__add {
  display: flex;
  gap: 7px;
}
.as__input {
  font-family: inherit;
  font-size: calc(14px * var(--pt-text-scale));
  padding: 9px 11px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink);
}
.as__input--name {
  flex: 1;
  min-width: 0;
}
.as__input--num {
  width: 70px;
}
.as__input:focus {
  outline: none;
  border-color: var(--pt-ink);
}
.as__hint {
  font-size: calc(11px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  line-height: 1.4;
}
</style>
