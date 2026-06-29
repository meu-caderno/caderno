<script setup lang="ts">
import { simulateAbsences } from "@meu-caderno/core";
import type { SubjectStats } from "~/composables/useCaderno";

const props = defineProps<{ stat: SubjectStats }>();

const extra = ref(1);

const scenario = computed(() =>
  simulateAbsences({ remaining: props.stat.restantes }, extra.value),
);
const verdict = computed(() =>
  scenario.value.meetsBudget
    ? { label: "ainda dentro do limite", color: "#2f7d4f" }
    : { label: "estoura o limite de faltas", color: "#c0392b" },
);
</script>

<template>
  <div class="simulator">
    <div class="simulator__head">
      <span class="simulator__q">Se eu faltar</span>
      <UINumberField v-model="extra" :min="0" :max="60" />
      <span class="simulator__q">aula(s)…</span>
    </div>
    <div class="simulator__result" :style="{ color: verdict.color }">
      <span class="simulator__rest">
        {{ scenario.remaining > 0 ? scenario.remaining : 0 }}
      </span>
      <span class="simulator__label">restariam · {{ verdict.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.simulator {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 14px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px dashed var(--pt-border-muted);
  background: var(--pt-card);
}
.simulator__head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.simulator__q {
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink-soft);
}
.simulator__result {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.simulator__rest {
  font-size: calc(26px * var(--pt-text-scale));
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.simulator__label {
  font-size: calc(12px * var(--pt-text-scale));
  font-weight: 600;
}
</style>
