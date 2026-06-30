<script setup lang="ts">
import { SCREEN_DENSITIES, useTheme } from "~/composables/useTheme";

const { screenDensity, setScreenDensity, zen, setZen } = useTheme();
</script>

<template>
  <SectionSettingsCard
    title="Densidade da tela"
    subtitle="Quanta informação aparece de uma vez."
  >
    <div class="display-card__options">
      <button
        v-for="option in SCREEN_DENSITIES"
        :key="option.value"
        type="button"
        class="display-card__option"
        :class="{ 'display-card__option--on': option.value === screenDensity }"
        @click="setScreenDensity(option.value)"
      >
        <span class="display-card__label">{{ option.label }}</span>
        <span class="display-card__blurb">{{ option.blurb }}</span>
      </button>
    </div>

    <div class="display-card__zen">
      <div class="display-card__zen-text">
        <b>Ambiente de foco</b>
        <small>Recolhe a moldura e deixa só o conteúdo.</small>
      </div>
      <UISwitch
        :model-value="zen"
        @update:model-value="setZen($event)"
      />
    </div>
  </SectionSettingsCard>
</template>

<style scoped>
.display-card__options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 8px;
}
.display-card__option {
  display: flex;
  flex-direction: column;
  gap: 3px;
  text-align: left;
  font-family: inherit;
  padding: 12px 14px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink);
  cursor: pointer;
}
.display-card__option--on {
  border-color: var(--pt-accent);
}
.display-card__label {
  font-size: calc(14px * var(--pt-text-scale));
  font-weight: 700;
}
.display-card__blurb {
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
.display-card__zen {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 12px;
  border-top: 1.5px dashed var(--pt-border-faint);
}
.display-card__zen-text {
  display: flex;
  flex-direction: column;
}
.display-card__zen-text b {
  font-size: calc(14px * var(--pt-text-scale));
  font-weight: 600;
}
.display-card__zen-text small {
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
</style>
