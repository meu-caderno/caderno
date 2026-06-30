<script setup lang="ts">
import type {
  Activity,
  AttendanceRecord,
  Context,
  Id,
  Subject,
} from "@meu-caderno/core";
import {
  ActivityStatus,
  Goal,
  Root,
  recordsOf,
  sortByDue,
} from "@meu-caderno/core";
import type { ContextStat } from "~/components/Section/Contexto/StatsRow.vue";
import {
  deriveStats,
  type SubjectStats,
  UNSET_DAY,
} from "~/utils/caderno-stats";

const { store, clock } = useCadernoService();
const routeId = useRoute().params.id as Id;

const today = ref<string>(UNSET_DAY);
const { completeActivity } = useAttendanceActions({ today });

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

const upcoming = computed(() =>
  sortByDue(
    allActivities.value.filter(
      (activity) =>
        activity.contextId === routeId &&
        activity.status === ActivityStatus.OPEN &&
        activity.root !== Root.INBOX,
    ),
  ),
);

const statCards = computed<ContextStat[]>(() => [
  {
    key: "frequency",
    label: "Frequência média",
    value: `${averageFrequency.value}%`,
    hint: subjects.value.length ? undefined : "sem disciplinas",
  },
  { key: "subjects", label: "Disciplinas", value: `${subjects.value.length}` },
  { key: "pending", label: "Pendências", value: `${upcoming.value.length}` },
]);

const isExam = computed(() => context.value?.goal === Goal.PUBLIC_EXAM);

const configuring = ref(false);
const managingGoals = ref(false);
const detailId = ref<Id | null>(null);
const notasId = ref<Id | null>(null);
const editingActivity = ref<Activity | null>(null);

function statById(id: Id | null): SubjectStats | null {
  if (!id) return null;
  return stats.value.find((stat) => stat.subject.id === id) ?? null;
}
const detailStat = computed(() => statById(detailId.value));
const notasSubject = computed(() => statById(notasId.value)?.subject ?? null);
function openNotas() {
  notasId.value = detailStat.value?.subject.id ?? null;
}
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
      <SectionContextoHeader
        :context="context"
        :today="today"
        @configure="configuring = true"
      />

      <SectionContextoStatsRow :stats="statCards" />

      <SectionContextoVisionBlock
        v-if="context.vision"
        :vision="context.vision"
      />

      <SectionContextoEdital
        v-if="isExam"
        :stats="stats"
        :terms="context.terms ?? []"
        :today="today"
      />

      <SectionContextoModulesRow :modules="context.modules" />

      <SectionHomeGoalsSection
        :context="context"
        :today="today"
        @manage="managingGoals = true"
      />

      <SectionContextoSubjectsGrid
        :stats="stats"
        @notas="notasId = $event"
        @detail="detailId = $event"
      />

      <SectionContextoUpcomingActivities
        :activities="upcoming"
        :subjects="subjects"
        :today="today"
        @complete="completeActivity"
        @edit="editingActivity = $event"
      />

      <SectionContextoShortcuts :context-id="context.id" />

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
      <SectionHomeSubjectDetail
        v-if="detailStat"
        :stat="detailStat"
        @close="detailId = null"
        @notas="openNotas"
        @edit="detailId = null"
        @delete="detailId = null"
      />
      <SectionHomeAssessments
        v-if="notasSubject"
        :subject="notasSubject"
        @close="notasId = null"
      />
      <SectionHomeActivityForm
        v-if="editingActivity"
        :activity="editingActivity"
        :subjects="subjects"
        :activities="allActivities"
        @done="editingActivity = null"
        @cancel="editingActivity = null"
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
</style>
