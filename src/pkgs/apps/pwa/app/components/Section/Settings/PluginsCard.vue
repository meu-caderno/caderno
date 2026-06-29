<script setup lang="ts">
import type { PulseStat } from "~/utils/studyPulse";
import { STUDY_PULSE_ID } from "~/utils/studyPulse";

const { plugins, capabilities } = useCadernoService();

const pulse = ref<PulseStat[]>([]);

function refresh() {
  const source = capabilities.source<PulseStat>(STUDY_PULSE_ID);
  pulse.value = source ? [...source.list()] : [];
}

onMounted(refresh);
</script>

<template>
  <UICard pad="18px" class="plugins-card">
    <div class="plugins-card__head">
      <h2 class="pt-hand plugins-card__title">Plugins</h2>
      <p class="plugins-card__sub">
        Capacidades carregadas neste aparelho.
      </p>
    </div>

    <div class="plugins-card__list">
      <div
        v-for="manifest in plugins"
        :key="manifest.id"
        class="plugins-card__item"
      >
        <div class="plugins-card__item-head">
          <span class="plugins-card__name">{{ manifest.title }}</span>
          <span class="plugins-card__origin">{{ manifest.origin }}</span>
        </div>
        <span class="plugins-card__id">{{ manifest.id }}</span>
      </div>
    </div>

    <div v-if="pulse.length" class="plugins-card__pulse">
      <div class="plugins-card__pulse-head">
        <span class="pt-eyebrow">Pulso de estudo (exemplo)</span>
        <button
          type="button"
          class="plugins-card__refresh"
          aria-label="Atualizar"
          @click="refresh"
        >
          <UIIcon icon="rotate-ccw" :size="14" />
        </button>
      </div>
      <div
        v-for="stat in pulse"
        :key="stat.label"
        class="plugins-card__stat"
      >
        <span>{{ stat.label }}</span>
        <b>{{ stat.value }}</b>
      </div>
    </div>
  </UICard>
</template>

<style scoped>
.plugins-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.plugins-card__title {
  font-size: calc(19px * var(--pt-text-scale));
  font-weight: 700;
  margin: 0;
}
.plugins-card__sub {
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  margin: 4px 0 0;
}
.plugins-card__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.plugins-card__item {
  padding: 10px 12px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
}
.plugins-card__item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.plugins-card__name {
  font-size: calc(14px * var(--pt-text-scale));
  font-weight: 600;
}
.plugins-card__origin {
  font-size: calc(11px * var(--pt-text-scale));
  font-weight: 700;
  color: var(--pt-ink-muted);
}
.plugins-card__id {
  font-size: calc(11px * var(--pt-text-scale));
  color: var(--pt-ink-faint);
}
.plugins-card__pulse {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  border-top: 1.5px dashed var(--pt-border-faint);
}
.plugins-card__pulse-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.plugins-card__refresh {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: var(--pt-radius-sm);
  border: none;
  background: var(--pt-paper-2);
  color: var(--pt-ink-muted);
  cursor: pointer;
}
.plugins-card__stat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: calc(13px * var(--pt-text-scale));
}
.plugins-card__stat b {
  font-variant-numeric: tabular-nums;
}
</style>
