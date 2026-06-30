<script setup lang="ts">
import type { DayIso, Term } from "@meu-caderno/core";
import { daysBetween } from "@meu-caderno/core";
import type { SubjectStats } from "~/utils/caderno-stats";

const props = defineProps<{
  stats: SubjectStats[];
  terms: Term[];
  today: string;
}>();

const examTerm = computed<Term | null>(() => props.terms[0] ?? null);

const daysLeft = computed(() => {
  const end = examTerm.value?.end;
  if (!end) return null;
  const days = daysBetween(props.today as DayIso, end);
  return days >= 0 ? days : null;
});

const materias = computed(() =>
  props.stats.map((stat) => ({
    id: stat.subject.id,
    name: stat.subject.name,
    color: stat.subject.color,
    pct: stat.freqPct,
  })),
);
</script>

<template>
  <section class="block edital">
    <div class="block__head">
      <h2 class="pt-hand block__title">📚 Edital & prova</h2>
    </div>

    <div v-if="daysLeft != null" class="edital__count">
      <span class="edital__count-n">{{ daysLeft }}</span>
      <span class="edital__count-l">
        dia(s) até a prova · {{ examTerm?.label }}
      </span>
    </div>
    <p v-else class="edital__empty">
      Defina a data da prova no período para ver a contagem.
    </p>

    <div v-if="materias.length" class="edital__bars">
      <div v-for="materia in materias" :key="materia.id" class="edital__bar">
        <div class="edital__bar-head">
          <span class="edital__bar-name">{{ materia.name }}</span>
          <span class="edital__bar-val">{{ materia.pct }}%</span>
        </div>
        <div class="edital__track">
          <div
            class="edital__fill"
            :style="{ width: `${materia.pct}%`, background: materia.color }"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.edital__count {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 12px 14px;
  border-radius: var(--pt-radius-sm);
  background: var(--pt-card);
}
.edital__count-n {
  font-size: calc(28px * var(--pt-text-scale));
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: var(--pt-accent);
}
.edital__count-l {
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
.edital__empty {
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  margin: 0;
}
.edital__bars {
  display: flex;
  flex-direction: column;
  gap: 11px;
  margin-top: 14px;
}
.edital__bar-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 5px;
  gap: 8px;
}
.edital__bar-name {
  font-size: calc(14px * var(--pt-text-scale));
  font-weight: 600;
}
.edital__bar-val {
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  font-variant-numeric: tabular-nums;
}
.edital__track {
  height: 10px;
  border-radius: 6px;
  background: var(--pt-card);
  border: 1.5px solid var(--pt-border-muted);
  overflow: hidden;
}
.edital__fill {
  height: 100%;
}
</style>
