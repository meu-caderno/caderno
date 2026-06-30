<script setup lang="ts">
import type {
  Activity,
  Record as AttendanceRecord,
  Context,
  Id,
  Subject,
} from "@meu-caderno/core";
import { ActivityStatus, Goal, Root, recordsOf } from "@meu-caderno/core";
import type { ContextStat } from "~/components/Section/Contexto/StatsRow.vue";
import { deriveStats, UNSET_DAY } from "~/utils/caderno-stats";

const { store, clock } = useCadernoService();
const routeId = useRoute().params.id as Id;

const GOAL_ICON: Record<Goal, string> = {
  [Goal.UNIVERSITY]: "🎓",
  [Goal.PUBLIC_EXAM]: "📚",
  [Goal.OPEN_COURSE]: "🧩",
  [Goal.FREE_STUDY]: "🌱",
  [Goal.NONE]: "📔",
};

const today = ref<string>(UNSET_DAY);
onMounted(async () => {
  today.value = await clock.today();
});

const ctx = useLiveQuery<Context | null | undefined>(
  ["contexts"],
  async () =>
    (await store.contexts.list()).find((entry) => entry.id === routeId) ?? null,
  undefined,
);
const loading = computed(() => ctx.value === undefined);
const context = computed(() => ctx.value ?? null);

const allSubjects = useLiveQuery(
  ["subjects"],
  () => store.subjects.list(),
  [] as Subject[],
);
const allRecords = useLiveQuery(
  ["records"],
  () => store.records.list(),
  [] as AttendanceRecord[],
);
const allActivities = useLiveQuery(
  ["activities"],
  () => store.activities.list(),
  [] as Activity[],
);

const subjects = computed(() =>
  allSubjects.value
    .filter((subject) => subject.contextId === routeId)
    .map((subject) => ({
      ...subject,
      records: recordsOf(allRecords.value, subject.id),
    })),
);

const stats = computed(() =>
  subjects.value.map((subject) =>
    deriveStats(subject, context.value?.attendanceFloor),
  ),
);

const averageFrequency = computed(() => {
  const all = stats.value;
  if (!all.length) return 0;
  return Math.round(
    all.reduce((sum, stat) => sum + stat.freqPct, 0) / all.length,
  );
});

const pendingCount = computed(
  () =>
    allActivities.value.filter(
      (activity) =>
        activity.contextId === routeId &&
        activity.status === ActivityStatus.OPEN &&
        activity.root !== Root.INBOX,
    ).length,
);

const statCards = computed<ContextStat[]>(() => [
  {
    key: "frequency",
    label: "Frequência média",
    value: `${averageFrequency.value}%`,
    hint: subjects.value.length ? undefined : "sem disciplinas",
  },
  { key: "subjects", label: "Disciplinas", value: `${subjects.value.length}` },
  { key: "pending", label: "Pendências", value: `${pendingCount.value}` },
]);

const headerTitle = computed(() =>
  context.value ? `${GOAL_ICON[context.value.goal]} ${context.value.name}` : "",
);

const configuring = ref(false);
const managingGoals = ref(false);

const shortcuts = [
  { to: "/disciplinas", icon: "📚", label: "Disciplinas" },
  { to: "/atividades", icon: "✓", label: "Atividades" },
  { to: "/agenda", icon: "🗓", label: "Agenda" },
];
</script>

<template>
  <div class="contexto">
    <div v-if="loading" class="contexto__boot">carregando…</div>

    <UIEmptyState
      v-else-if="!context"
      icon="🧭"
      title="Contexto não encontrado"
      subtitle="Ele pode ter sido removido ou o link está errado."
      action-label="Ver contextos"
      @action="navigateTo('/contextos')"
    />

    <template v-else>
      <SectionPageHeader :title="headerTitle" :subtitle="context.nature">
        <template #actions>
          <UIButton
            variant="fantasma"
            icon="settings"
            label="Configurar"
            @click="configuring = true"
          />
        </template>
      </SectionPageHeader>

      <SectionContextoStatsRow :stats="statCards" />

      <SectionContextoModulesRow :modules="context.modules" />

      <SectionHomeGoalsSection
        :context="context"
        :today="today"
        @manage="managingGoals = true"
      />

      <nav class="contexto__shortcuts" aria-label="Atalhos">
        <NuxtLink
          v-for="shortcut in shortcuts"
          :key="shortcut.to"
          :to="shortcut.to"
          class="contexto__shortcut"
        >
          <span class="contexto__shortcut-icon">{{ shortcut.icon }}</span>
          {{ shortcut.label }}
        </NuxtLink>
      </nav>

      <SectionHomeContextDetail
        v-if="configuring"
        :context="context"
        @close="configuring = false"
      />
      <SectionHomeGoalsManager
        v-if="managingGoals"
        :context="context"
        @done="managingGoals = false"
        @cancel="managingGoals = false"
      />
    </template>
  </div>
</template>

<style scoped>
.contexto {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--pt-pad-screen) 16px 64px;
  display: flex;
  flex-direction: column;
  gap: calc(16px * var(--pt-density));
  container-type: inline-size;
}
.contexto__boot {
  text-align: center;
  color: var(--pt-ink-muted);
  padding: 48px 0;
}
.contexto__shortcuts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.contexto__shortcut {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 10px;
  border-radius: var(--pt-radius);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  box-shadow: var(--pt-shadow);
  color: var(--pt-ink);
  text-decoration: none;
  font-size: calc(13px * var(--pt-text-scale));
  font-weight: 600;
}
.contexto__shortcut-icon {
  font-size: calc(22px * var(--pt-text-scale));
  line-height: 1;
}
</style>
