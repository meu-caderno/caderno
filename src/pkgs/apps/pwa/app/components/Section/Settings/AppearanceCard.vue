<script setup lang="ts">
import { Background } from "@meu-caderno/core";
import { BACKGROUND_OPTIONS, useAppearance } from "~/composables/useAppearance";

const { background, setBackground } = useAppearance();

function choose(value: Background) {
  if (value !== background.value) setBackground(value);
}
</script>

<template>
  <UICard pad="18px" class="appearance-card">
    <div class="appearance-card__head">
      <h2 class="pt-hand appearance-card__title">Aparência</h2>
      <p class="appearance-card__sub">Tom do papel deste aparelho.</p>
    </div>
    <div class="appearance-card__themes">
      <button
        v-for="option in BACKGROUND_OPTIONS"
        :key="option.value"
        type="button"
        class="appearance-card__theme"
        :class="{
          'appearance-card__theme--on': option.value === background,
        }"
        :data-bg="option.value"
        @click="choose(option.value)"
      >
        <span class="appearance-card__swatch" :data-bg="option.value" />
        <span class="appearance-card__label">{{ option.label }}</span>
      </button>
    </div>
  </UICard>
</template>

<style scoped>
.appearance-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.appearance-card__title {
  font-size: 19px;
  font-weight: 700;
  margin: 0;
}
.appearance-card__sub {
  font-size: 13px;
  color: var(--pt-ink-muted);
  margin: 4px 0 0;
}
.appearance-card__themes {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.appearance-card__theme {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  padding: 12px 16px;
  border-radius: var(--pt-radius);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink-soft);
  cursor: pointer;
}
.appearance-card__theme--on {
  border-color: var(--pt-ink);
  color: var(--pt-ink);
}
.appearance-card__swatch {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1.5px solid var(--pt-border-muted);
}
.appearance-card__swatch[data-bg="PAPER"] {
  background: #f4f1ea;
}
.appearance-card__swatch[data-bg="CREAM"] {
  background: #f7f1e2;
}
.appearance-card__swatch[data-bg="LINEN"] {
  background: #eef0eb;
}
</style>
