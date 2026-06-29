<script setup lang="ts">
import { SCREEN_DENSITIES, useTheme } from "~/composables/useTheme";

const { screenDensity, setScreenDensity } = useTheme();
</script>

<template>
  <UICard pad="18px" class="display-card">
    <div class="display-card__head">
      <h2 class="pt-hand display-card__title">Densidade da tela</h2>
      <p class="display-card__sub">Quanta informação aparece de uma vez.</p>
    </div>
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
  </UICard>
</template>

<style scoped>
.display-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.display-card__title {
  font-size: calc(19px * var(--pt-text-scale));
  font-weight: 700;
  margin: 0;
}
.display-card__sub {
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  margin: 4px 0 0;
}
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
</style>
