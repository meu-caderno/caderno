<script setup lang="ts">
import type { Context, Id } from "@meu-caderno/core";

interface PeriodSummary {
  averageFrequency: number;
  atRiskCount: number;
  totalSubjects: number;
}

defineProps<{
  context: Context | null;
  contexts: Context[];
  meta: string;
  period: PeriodSummary | null;
}>();
const emit = defineEmits<{
  selectContext: [id: Id];
  createContext: [];
  openSettings: [];
}>();
</script>

<template>
  <header class="context-header">
    <UICard radius="18px" pad="18px">
      <div class="context-header__top">
        <div class="context-header__identity">
          <SectionHomeContextSwitcher
            :contexts="contexts"
            :active="context"
            @select="emit('selectContext', $event)"
            @create="emit('createContext')"
          />
          <div class="context-header__meta">{{ meta }}</div>
        </div>
        <UIButton
          variant="leve"
          icon="settings"
          aria-label="Configurações"
          @click="emit('openSettings')"
        />
      </div>

      <div v-if="period" class="context-header__period">
        <UIProgressRing
          :value="period.averageFrequency"
          :size="56"
          :stroke="7"
          color="var(--pt-ink)"
          caption="período"
        />
        <div class="context-header__period-text">
          <div class="context-header__period-line">
            Frequência média do período
            <b>{{ period.averageFrequency }}%</b>
          </div>
          <div class="context-header__period-sub">
            <template v-if="period.atRiskCount">
              {{ period.atRiskCount }} de {{ period.totalSubjects }} disciplinas
              pedem atenção
            </template>
            <template v-else>Tudo tranquilo por aqui ✦</template>
          </div>
        </div>
      </div>
    </UICard>
  </header>
</template>

<style scoped>
.context-header__top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.context-header__identity {
  flex: 1;
  min-width: 0;
}
.context-header__meta {
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  margin-top: 3px;
}
.context-header__period {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-top: 16px;
  padding-top: 15px;
  border-top: 1.5px dashed var(--pt-border-faint);
}
.context-header__period-line {
  font-size: calc(14px * var(--pt-text-scale));
  font-weight: 600;
}
.context-header__period-line b {
  font-variant-numeric: tabular-nums;
}
.context-header__period-sub {
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  margin-top: 2px;
}
</style>
