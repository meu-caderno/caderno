<script setup lang="ts">
import { MOODS, useTheme } from "~/composables/useTheme";

const { moodKey, setMood } = useTheme();

function choose(key: string) {
  if (key !== moodKey.value) setMood(key);
}
</script>

<template>
  <UICard pad="18px" class="moods-card">
    <div class="moods-card__head">
      <h2 class="pt-hand moods-card__title">Perfil da Home</h2>
      <p class="moods-card__sub">
        Define o tom do papel, a cor de destaque e a densidade.
      </p>
    </div>
    <div class="moods-card__grid">
      <button
        v-for="mood in MOODS"
        :key="mood.key"
        type="button"
        class="moods-card__mood"
        :class="{ 'moods-card__mood--on': mood.key === moodKey }"
        @click="choose(mood.key)"
      >
        <span class="moods-card__emoji">{{ mood.emoji }}</span>
        <span class="moods-card__label">{{ mood.label }}</span>
        <span class="moods-card__blurb">{{ mood.blurb }}</span>
        <span class="moods-card__accent" :style="{ background: mood.accent }" />
      </button>
    </div>
  </UICard>
</template>

<style scoped>
.moods-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.moods-card__title {
  font-size: calc(19px * var(--pt-text-scale));
  font-weight: 700;
  margin: 0;
}
.moods-card__sub {
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  margin: 4px 0 0;
}
.moods-card__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}
.moods-card__mood {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
  font-family: inherit;
  padding: 12px 14px;
  border-radius: var(--pt-radius);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink);
  cursor: pointer;
}
.moods-card__mood--on {
  border-color: var(--pt-ink);
}
.moods-card__emoji {
  font-size: calc(22px * var(--pt-text-scale));
  line-height: 1;
}
.moods-card__label {
  font-size: calc(14px * var(--pt-text-scale));
  font-weight: 700;
}
.moods-card__blurb {
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
.moods-card__accent {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
</style>
