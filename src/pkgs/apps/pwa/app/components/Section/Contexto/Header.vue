<script setup lang="ts">
import type { Context, DayIso, Term } from "@meu-caderno/core";
import { AbsenceStance, daysBetween, Goal } from "@meu-caderno/core";

const props = defineProps<{ context: Context; today: string }>();
const emit = defineEmits<{ configure: [] }>();

const GOAL_ICON: Record<Goal, string> = {
  [Goal.UNIVERSITY]: "🎓",
  [Goal.PUBLIC_EXAM]: "📚",
  [Goal.OPEN_COURSE]: "🧩",
  [Goal.FREE_STUDY]: "🌱",
  [Goal.NONE]: "📔",
};

const title = computed(
  () => `${GOAL_ICON[props.context.goal]} ${props.context.name}`,
);

interface StanceView {
  label: string;
  tone: "info" | "ok";
}
const STANCE: Record<AbsenceStance, StanceView> = {
  [AbsenceStance.PLAN_ABSENCES]: {
    label: "🎯 Planejo minhas faltas",
    tone: "info",
  },
  [AbsenceStance.FOCUS_ON_NOT_MISSING]: {
    label: "🛡 Foco em não faltar",
    tone: "ok",
  },
};
const stance = computed(() => STANCE[props.context.absenceStance]);

function termEnded(term: Term): boolean {
  return term.end != null && daysBetween(props.today as DayIso, term.end) < 0;
}

const termChips = computed(() =>
  (props.context.terms ?? []).map((term) => ({
    id: term.id,
    label: term.label,
    ended: termEnded(term),
  })),
);

const archived = computed(() => {
  const chips = termChips.value;
  return chips.length > 0 && chips.every((chip) => chip.ended);
});
</script>

<template>
  <header class="ctx-header">
    <div class="ctx-header__top">
      <div class="ctx-header__identity">
        <h1 class="pt-hand ctx-header__title">{{ title }}</h1>
        <p v-if="context.nature" class="ctx-header__sub">{{ context.nature }}</p>
      </div>
      <UIButton
        variant="fantasma"
        icon="settings"
        label="Configurar"
        @click="emit('configure')"
      />
    </div>

    <div class="ctx-header__meta">
      <UIBadge :tone="stance.tone" size="md" :label="stance.label" />
      <UIBadge
        v-for="chip in termChips"
        :key="chip.id"
        :tone="chip.ended ? 'neutro' : 'info'"
        size="md"
        :label="chip.ended ? `${chip.label} · encerrado` : chip.label"
      />
    </div>

    <div v-if="archived" class="ctx-header__banner">
      📁 período arquivado — somente leitura
    </div>
  </header>
</template>

<style scoped>
.ctx-header__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.ctx-header__identity {
  flex: 1;
  min-width: 0;
}
.ctx-header__title {
  font-size: calc(26px * var(--pt-text-scale));
  font-weight: 800;
  margin: 0;
}
.ctx-header__sub {
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  margin: 4px 0 0;
}
.ctx-header__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
.ctx-header__banner {
  margin-top: 12px;
  padding: 10px 14px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px dashed var(--pt-border-muted);
  background: var(--pt-paper-2);
  color: var(--pt-ink-muted);
  font-size: calc(13px * var(--pt-text-scale));
  font-weight: 600;
}
</style>
