<script setup lang="ts">
import { AbsenceStance } from "@meu-caderno/core";

const stance = defineModel<string>("stance", {
  default: AbsenceStance.PLAN_ABSENCES,
});
const floor = defineModel<number>("floor", { default: 75 });
const emit = defineEmits<{ next: []; back: [] }>();

const stanceOptions = [
  {
    value: AbsenceStance.FOCUS_ON_NOT_MISSING,
    label: "🎯 Foco em não faltar",
    desc: "Quero presença máxima. O planejador fica discreto.",
  },
  {
    value: AbsenceStance.PLAN_ABSENCES,
    label: "🗓 Planejar faltas",
    desc: "Quero ver onde dá pra faltar sem reprovar.",
  },
];
</script>

<template>
  <div class="attendance-step">
    <h2 class="pt-hand attendance-step__title">Sua postura com faltas</h2>
    <p class="attendance-step__sub">
      Pode mudar a qualquer momento, por contexto.
    </p>

    <UIRadioGroup v-model="stance" :options="stanceOptions" />

    <UIField label="Piso de frequência" hint="A escola costuma exigir 75%.">
      <div class="attendance-step__floor">
        <UINumberField v-model="floor" :min="1" :max="100" />
        <span class="attendance-step__pct">%</span>
      </div>
    </UIField>

    <UIButton variant="primal" full label="Continuar" @click="emit('next')" />
  </div>
</template>

<style scoped>
.attendance-step {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.attendance-step__title {
  font-size: calc(26px * var(--pt-text-scale));
  font-weight: 700;
  margin: 0;
}
.attendance-step__sub {
  font-size: calc(14px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  margin: -6px 0 4px;
}
.attendance-step__floor {
  display: flex;
  align-items: center;
  gap: 8px;
}
.attendance-step__pct {
  font-size: calc(15px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
</style>
