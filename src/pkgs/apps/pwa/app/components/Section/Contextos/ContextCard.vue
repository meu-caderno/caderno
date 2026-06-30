<script setup lang="ts">
import type { Context, Modules } from "@meu-caderno/core";
import { Goal, Link } from "@meu-caderno/core";

const props = defineProps<{ context: Context; active?: boolean }>();
const emit = defineEmits<{ open: []; activate: [] }>();

const goalIcon: Record<Goal, string> = {
  [Goal.UNIVERSITY]: "🎓",
  [Goal.PUBLIC_EXAM]: "📚",
  [Goal.OPEN_COURSE]: "🧩",
  [Goal.FREE_STUDY]: "🌱",
  [Goal.NONE]: "📔",
};

const linkLabel: Record<Link, string> = {
  [Link.PERSONAL]: "Pessoal",
  [Link.CLASS]: "Turma",
  [Link.GROUP]: "Grupo",
};

const icon = computed(() => goalIcon[props.context.goal]);
const typeLabel = computed(() => linkLabel[props.context.link]);

const activeModules = computed(() => {
  const modules = props.context.modules as Modules;
  return Object.values(modules).filter(Boolean).length;
});

const floorPct = computed(() =>
  Math.round((props.context.attendanceFloor ?? 0) * 100),
);

const isDefault = computed(
  () => props.active === true || props.context.pinned === true,
);
const defaultLabel = computed(() => (props.active ? "ativo" : "padrão"));
</script>

<template>
  <article class="ctx-card" :class="{ 'ctx-card--active': active }">
    <button type="button" class="ctx-card__body" @click="emit('open')">
      <span class="ctx-card__icon">{{ icon }}</span>
      <span class="ctx-card__main">
        <span class="ctx-card__top">
          <span class="ctx-card__name pt-hand">{{ context.name }}</span>
          <UIBadge
            v-if="isDefault"
            :tone="active ? 'ok' : 'neutro'"
            :label="defaultLabel"
          />
        </span>
        <span class="ctx-card__tags">
          <UIBadge tone="info" :label="typeLabel" />
        </span>
        <span class="ctx-card__meta">
          {{ activeModules }} módulos ativos
          <template v-if="floorPct">· piso {{ floorPct }}%</template>
        </span>
      </span>
    </button>
    <UIButton
      v-if="!active"
      variant="leve"
      icon="check"
      label="Ativar"
      @click="emit('activate')"
    />
  </article>
</template>

<style scoped>
.ctx-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border-radius: var(--pt-radius);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  box-shadow: var(--pt-shadow);
}
.ctx-card--active {
  border-color: var(--pt-ink);
}
.ctx-card__body {
  display: flex;
  gap: 12px;
  width: 100%;
  text-align: left;
  font-family: inherit;
  background: none;
  border: none;
  padding: 0;
  color: var(--pt-ink);
  cursor: pointer;
}
.ctx-card__icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: calc(24px * var(--pt-text-scale));
  border-radius: var(--pt-radius-sm);
  background: var(--pt-paper-2);
}
.ctx-card__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ctx-card__top {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ctx-card__name {
  font-size: calc(17px * var(--pt-text-scale));
  font-weight: 700;
  line-height: 1.1;
}
.ctx-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.ctx-card__meta {
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
</style>
