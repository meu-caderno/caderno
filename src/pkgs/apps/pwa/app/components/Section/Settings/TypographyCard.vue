<script setup lang="ts">
import { HEADING_FONTS, TEXT_SIZES, useTheme } from "~/composables/useTheme";

const { textScale, headingFont, setTextScale, setHeadingFont } = useTheme();
</script>

<template>
  <UICard pad="18px" class="typography-card">
    <div class="typography-card__head">
      <h2 class="pt-hand typography-card__title">Tipografia</h2>
      <p class="typography-card__sub">Tamanho do texto e fonte dos títulos.</p>
    </div>

    <div class="typography-card__group">
      <span class="pt-eyebrow">Tamanho do texto</span>
      <div class="typography-card__options">
        <button
          v-for="size in TEXT_SIZES"
          :key="size.value"
          type="button"
          class="typography-card__chip"
          :class="{ 'typography-card__chip--on': size.value === textScale }"
          :style="{ fontSize: `calc(14px * ${size.value})` }"
          @click="setTextScale(size.value)"
        >
          {{ size.label }}
        </button>
      </div>
    </div>

    <div class="typography-card__group">
      <span class="pt-eyebrow">Fonte dos títulos</span>
      <div class="typography-card__options">
        <button
          v-for="font in HEADING_FONTS"
          :key="font.key"
          type="button"
          class="typography-card__chip"
          :class="{ 'typography-card__chip--on': font.key === headingFont }"
          :style="{ fontFamily: font.family }"
          @click="setHeadingFont(font.key)"
        >
          {{ font.label }}
        </button>
      </div>
    </div>
  </UICard>
</template>

<style scoped>
.typography-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.typography-card__title {
  font-size: calc(19px * var(--pt-text-scale));
  font-weight: 700;
  margin: 0;
}
.typography-card__sub {
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  margin: 4px 0 0;
}
.typography-card__group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.typography-card__options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.typography-card__chip {
  font-family: inherit;
  font-size: calc(14px * var(--pt-text-scale));
  font-weight: 600;
  padding: 9px 14px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink-soft);
  cursor: pointer;
}
.typography-card__chip--on {
  border-color: var(--pt-accent);
  color: var(--pt-ink);
}
</style>
