<script setup lang="ts">
interface PeriodSummary {
  averageFrequency: number;
  atRiskCount: number;
  totalSubjects: number;
}

defineProps<{
  period: PeriodSummary | null;
  pending: number;
  todayClasses: number;
}>();
const emit = defineEmits<{ action: [key: string] }>();
</script>

<template>
  <section class="block quick-stats">
    <div class="block__head">
      <h2 class="pt-hand block__title">Resumo</h2>
    </div>
    <div class="quick-stats__grid">
      <div class="quick-stats__box">
        <span class="quick-stats__value">
          {{ period ? `${period.averageFrequency}%` : "—" }}
        </span>
        <span class="quick-stats__label">Frequência média</span>
      </div>
      <div class="quick-stats__box">
        <span class="quick-stats__value">{{ period?.atRiskCount ?? 0 }}</span>
        <span class="quick-stats__label">Em risco</span>
      </div>
      <div class="quick-stats__box">
        <span class="quick-stats__value">{{ pending }}</span>
        <span class="quick-stats__label">Pendentes</span>
      </div>
      <div class="quick-stats__box">
        <span class="quick-stats__value">{{ todayClasses }}</span>
        <span class="quick-stats__label">Aulas hoje</span>
      </div>
    </div>
    <div class="quick-stats__actions">
      <UIButton
        variant="leve"
        icon="plus"
        label="Atividade"
        @click="emit('action', 'activity')"
      />
      <UIButton
        variant="leve"
        icon="search"
        label="Capturar"
        @click="emit('action', 'capture')"
      />
      <NuxtLink to="/agenda" class="quick-stats__link">
        <UIButton variant="fantasma" icon="calendar" label="Agenda" />
      </NuxtLink>
      <NuxtLink to="/caderno" class="quick-stats__link">
        <UIButton variant="fantasma" icon="list" label="Caderno" />
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.quick-stats__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.quick-stats__box {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 11px 12px;
  border-radius: var(--pt-radius);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
}
.quick-stats__value {
  font-size: calc(22px * var(--pt-text-scale));
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.quick-stats__label {
  font-size: calc(11px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
.quick-stats__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.quick-stats__link {
  text-decoration: none;
}
@container (max-width: 460px) {
  .quick-stats__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
