<script setup lang="ts">
import type { Achievement } from "@meu-caderno/core";
import { ACHIEVEMENT_PRESENTATION } from "~/utils/achievements";

defineProps<{
  level: number;
  xp: number;
  ratio: number;
  toNextLevel: number;
  streak: number;
  badges: Achievement[];
}>();
</script>

<template>
  <section class="block gamification">
    <div class="block__head">
      <h2 class="pt-hand block__title">Progresso</h2>
      <span class="gamification__streak">🔥 {{ streak }} dia(s)</span>
    </div>

    <div class="gamification__level">
      <div class="gamification__level-row">
        <span class="gamification__level-n">Nível {{ level }}</span>
        <span class="gamification__xp">{{ xp }} XP · faltam {{ toNextLevel }}</span>
      </div>
      <div class="gamification__track">
        <div
          class="gamification__fill"
          :style="{ width: `${Math.round(ratio * 100)}%` }"
        />
      </div>
    </div>

    <div class="gamification__badges">
      <div
        v-for="badge in badges"
        :key="badge.key"
        class="gamification__badge"
        :class="{ 'gamification__badge--off': !badge.unlocked }"
        :title="ACHIEVEMENT_PRESENTATION[badge.key].label"
      >
        <span class="gamification__badge-icon">
          {{ ACHIEVEMENT_PRESENTATION[badge.key].icon }}
        </span>
        <span class="gamification__badge-label">
          {{ ACHIEVEMENT_PRESENTATION[badge.key].label }}
        </span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.gamification__streak {
  font-size: calc(13px * var(--pt-text-scale));
  font-weight: 700;
  color: var(--pt-ink-soft);
}
.gamification__level-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}
.gamification__level-n {
  font-size: calc(16px * var(--pt-text-scale));
  font-weight: 700;
}
.gamification__xp {
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  font-variant-numeric: tabular-nums;
}
.gamification__track {
  height: 11px;
  border-radius: 7px;
  background: var(--pt-card);
  border: 1.5px solid var(--pt-border-muted);
  overflow: hidden;
}
.gamification__fill {
  height: 100%;
  background: var(--pt-accent);
}
.gamification__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.gamification__badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 11px;
  border-radius: var(--pt-radius-pill);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  font-size: calc(12px * var(--pt-text-scale));
  font-weight: 600;
}
.gamification__badge--off {
  opacity: 0.4;
}
.gamification__badge-icon {
  font-size: calc(15px * var(--pt-text-scale));
  line-height: 1;
}
</style>
