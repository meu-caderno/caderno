<script setup lang="ts">
import type { Context, DayIso } from "@meu-caderno/core";
import { activeTerm, daysBetween, degreeProgress } from "@meu-caderno/core";

const props = defineProps<{ context: Context; today: string }>();
const emit = defineEmits<{ manage: [] }>();

const progress = computed(() => degreeProgress(props.context.buckets ?? []));
const hasBuckets = computed(() => progress.value.buckets.length > 0);

const tracksGoals = computed(() => {
  const modules = props.context.modules;
  return modules.syllabus || modules.certificate || modules.hours;
});
const visible = computed(
  () => hasBuckets.value || countdown.value != null || tracksGoals.value,
);

const countdown = computed(() => {
  const term = activeTerm(props.context.terms ?? [], props.today as DayIso);
  if (!term?.end) return null;
  const days = daysBetween(props.today as DayIso, term.end);
  if (days < 0) return null;
  return { label: term.label, days };
});

function pct(ratio: number) {
  return Math.round(ratio * 100);
}
</script>

<template>
  <section v-if="visible" class="block goals-section">
    <div class="block__head">
      <h2 class="pt-hand block__title">Metas</h2>
      <UIButton
        variant="fantasma"
        icon="pencil"
        label="Gerenciar"
        @click="emit('manage')"
      />
    </div>

    <div
      v-if="!hasBuckets && !countdown"
      class="goals-section__empty"
    >
      Defina baldes de integralização, horas ou progresso do curso.
    </div>

    <div v-if="countdown" class="goals-section__countdown">
      <span class="goals-section__count-n">{{ countdown.days }}</span>
      <span class="goals-section__count-l">
        dia(s) restante(s) · {{ countdown.label }}
      </span>
    </div>

    <div v-if="hasBuckets" class="goals-section__buckets">
      <div
        v-for="bucket in progress.buckets"
        :key="bucket.id"
        class="goals-section__bucket"
      >
        <div class="goals-section__bucket-head">
          <span class="goals-section__bucket-name">{{ bucket.name }}</span>
          <span class="goals-section__bucket-val">
            {{ bucket.done }}/{{ bucket.goal }}
          </span>
        </div>
        <div class="goals-section__track">
          <div
            class="goals-section__fill"
            :class="{ 'goals-section__fill--done': bucket.complete }"
            :style="{ width: `${pct(bucket.ratio)}%` }"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.goals-section__empty {
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
.goals-section__countdown {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 12px 14px;
  border-radius: var(--pt-radius-sm);
  background: var(--pt-card);
}
.goals-section__count-n {
  font-size: calc(28px * var(--pt-text-scale));
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: var(--pt-accent);
}
.goals-section__count-l {
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
.goals-section__buckets {
  display: flex;
  flex-direction: column;
  gap: 11px;
}
.goals-section__bucket-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 5px;
  gap: 8px;
}
.goals-section__bucket-name {
  font-size: calc(14px * var(--pt-text-scale));
  font-weight: 600;
}
.goals-section__bucket-val {
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  font-variant-numeric: tabular-nums;
}
.goals-section__track {
  height: 10px;
  border-radius: 6px;
  background: var(--pt-card);
  border: 1.5px solid var(--pt-border-muted);
  overflow: hidden;
}
.goals-section__fill {
  height: 100%;
  background: var(--pt-accent);
}
.goals-section__fill--done {
  background: var(--pt-ok);
}
</style>
