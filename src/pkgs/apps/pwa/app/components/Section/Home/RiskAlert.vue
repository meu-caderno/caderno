<script setup lang="ts">
import type { Id } from "@meu-caderno/core";
import type { SubjectStats } from "~/composables/useCaderno";

const props = defineProps<{ stats: SubjectStats[] }>();
const emit = defineEmits<{ detail: [subjectId: Id] }>();

const atRisk = computed(() =>
  props.stats.filter((stat) => stat.status.key !== "ok"),
);

function restantesLabel(stat: SubjectStats): string {
  if (stat.restantes <= 0) return "sem margem";
  if (stat.restantes === 1) return "1 falta restante";
  return `${stat.restantes} faltas restantes`;
}
</script>

<template>
  <section v-if="atRisk.length" class="risk-alert">
    <div class="risk-alert__head">
      <span class="risk-alert__icon">⚠️</span>
      <h2 class="pt-hand risk-alert__title">Atenção à frequência</h2>
    </div>
    <button
      v-for="stat in atRisk"
      :key="stat.subject.id"
      type="button"
      class="risk-alert__row"
      @click="emit('detail', stat.subject.id)"
    >
      <span
        class="risk-alert__dot"
        :style="{ background: stat.status.color }"
      />
      <span class="risk-alert__name">{{ stat.subject.name }}</span>
      <span
        class="risk-alert__rest"
        :style="{ color: stat.status.color }"
      >
        {{ restantesLabel(stat) }}
      </span>
    </button>
  </section>
</template>

<style scoped>
.risk-alert {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
}
.risk-alert__head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.risk-alert__icon {
  font-size: calc(18px * var(--pt-text-scale));
  line-height: 1;
}
.risk-alert__title {
  font-size: calc(17px * var(--pt-text-scale));
  font-weight: 700;
  margin: 0;
}
.risk-alert__row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 4px;
  font-family: inherit;
  font-size: calc(14px * var(--pt-text-scale));
  text-align: left;
  background: none;
  border: none;
  border-top: 1.5px dashed var(--pt-border-faint);
  color: var(--pt-ink);
  cursor: pointer;
}
.risk-alert__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}
.risk-alert__name {
  flex: 1;
  font-weight: 600;
}
.risk-alert__rest {
  font-size: calc(12px * var(--pt-text-scale));
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
</style>
