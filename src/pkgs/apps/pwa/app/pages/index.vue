<script setup lang="ts">
import { useCaderno } from "~/composables/useCaderno";
import { HOME_WIDGETS } from "~/composables/useLayout";

const {
  context,
  contexts,
  setActive,
  stats,
  roll,
  mark,
  completeActivity,
  pendingActivities,
  inboxItems,
  gamification,
  activities,
  subjects,
  today,
  todayLabel,
  ready,
  booting,
} = useCaderno();

const { reviewing, close: closeOnboarding } = useOnboarding();
const { homeWidgets, ordered } = useLayout();
const { hasConsent } = useConsent();
const widgetKeys = HOME_WIDGETS.map((widget) => widget.key);
const orderedWidgets = computed(() => ordered(homeWidgets.value, widgetKeys));
const showGamification = computed(() => hasConsent("gamification"));

const {
  show: showWelcome,
  check: checkWelcome,
  dismiss: dismissWelcome,
} = useWelcomeBack();
watch(today, (value) => checkWelcome(value), { immediate: true });

const {
  creatingContext,
  editingContext,
  creatingSubject,
  editingSubject,
  deletingSubject,
  creatingActivity,
  editingActivity,
  managingGoals,
  capturing,
  showInbox,
  notasSubjectId,
  detailSubjectId,
  notasSubject,
  detailStat,
  startEditSubject,
  askDeleteSubject,
  confirmDeleteSubject,
  onQuickAction,
} = useHomeDialogs({ subjects, stats });

const headerMeta = computed(() => {
  const term = context.value?.terms?.[0]?.label;
  const count = `${subjects.value.length} disciplinas`;
  return [term, count, "neste aparelho"].filter(Boolean).join(" · ");
});

const period = computed(() => {
  const all = stats.value;
  if (!all.length) return null;
  const sum = all.reduce((total, stat) => total + stat.freqPct, 0);
  return {
    averageFrequency: Math.round(sum / all.length),
    atRiskCount: all.filter((stat) => stat.status.key !== "ok").length,
    totalSubjects: all.length,
  };
});
</script>

<template>
  <div v-if="booting" class="boot">carregando…</div>
  <SectionOnboardingWizard
    v-else-if="!ready || reviewing"
    :reviewing="reviewing"
    @done="closeOnboarding"
    @cancel="closeOnboarding"
  />
  <SectionHomeOnboarding
    v-else-if="creatingContext"
    cancelable
    @cancel="creatingContext = false"
    @done="creatingContext = false"
  />
  <div v-else class="home">
    <SectionHomeWelcomeBack
      v-if="showWelcome"
      :pending="pendingActivities.length"
      :classes="roll.length"
      @dismiss="dismissWelcome"
    />
    <SectionHomeContextHeader
      :context="context"
      :contexts="contexts"
      :meta="headerMeta"
      :period="period"
      @select-context="setActive"
      @create-context="creatingContext = true"
      @open-settings="editingContext = true"
    />
    <SectionHomeGamification
      v-if="showGamification"
      :level="gamification.level"
      :xp="gamification.xp"
      :ratio="gamification.ratio"
      :to-next-level="gamification.toNextLevel"
      :streak="gamification.streak"
      :badges="gamification.badges"
    />
    <template v-for="key in orderedWidgets" :key="key">
      <SectionHomeQuickStats
        v-if="key === 'stats'"
        :period="period"
        :pending="pendingActivities.length"
        :today-classes="roll.length"
        @action="onQuickAction"
      />
      <SectionHomeTodayRoll
        v-else-if="key === 'roll'"
        :roll="roll"
        :date-label="todayLabel"
        @mark="mark"
      />
      <SectionHomeRiskAlert
        v-else-if="key === 'risk'"
        :stats="stats"
        @detail="detailSubjectId = $event"
      />
      <SectionHomeGoalsSection
        v-else-if="key === 'goals' && context"
        :context="context"
        :today="today"
        @manage="managingGoals = true"
      />
      <SectionHomeSubjectsSection
        v-else-if="key === 'subjects'"
        :stats="stats"
        @create="creatingSubject = true"
        @notas="notasSubjectId = $event"
        @detail="detailSubjectId = $event"
      />
      <SectionHomeActivitiesSection
        v-else-if="key === 'activities'"
        :activities="pendingActivities"
        :subjects="subjects"
        :stats="stats"
        :today="today"
        @complete="completeActivity"
        @create="creatingActivity = true"
        @edit="editingActivity = $event"
      />
      <SectionHomePomodoroWidget v-else-if="key === 'pomodoro'" />
    </template>

    <SectionHomeSubjectForm
      v-if="creatingSubject"
      @done="creatingSubject = false"
      @cancel="creatingSubject = false"
    />
    <SectionHomeSubjectForm
      v-if="editingSubject"
      :subject="editingSubject"
      @done="editingSubject = null"
      @cancel="editingSubject = null"
    />
    <SectionHomeActivityForm
      v-if="creatingActivity"
      :subjects="subjects"
      :activities="activities"
      @done="creatingActivity = false"
      @cancel="creatingActivity = false"
    />
    <SectionHomeActivityForm
      v-if="editingActivity"
      :subjects="subjects"
      :activities="activities"
      :activity="editingActivity"
      @done="editingActivity = null"
      @cancel="editingActivity = null"
    />
    <SectionHomeAssessments
      v-if="notasSubject"
      :subject="notasSubject"
      @close="notasSubjectId = null"
    />
    <SectionHomeContextDetail
      v-if="editingContext && context"
      :context="context"
      @close="editingContext = false"
    />
    <SectionHomeGoalsManager
      v-if="managingGoals && context"
      :context="context"
      @done="managingGoals = false"
      @cancel="managingGoals = false"
    />
    <SectionHomeSubjectDetail
      v-if="detailStat"
      :stat="detailStat"
      @close="detailSubjectId = null"
      @notas="notasSubjectId = detailStat?.subject.id ?? null"
      @edit="startEditSubject"
      @delete="askDeleteSubject"
    />
    <UIConfirm
      v-if="deletingSubject"
      title="Excluir disciplina?"
      :description="`Isso remove ${deletingSubject.name}, suas presenças e atividades. Não dá para desfazer.`"
      confirm-label="Excluir"
      danger
      @confirm="confirmDeleteSubject"
      @cancel="deletingSubject = null"
    />
    <SectionHomeQuickCapture
      v-if="capturing"
      @done="capturing = false"
      @close="capturing = false"
    />
    <SectionHomeInbox
      v-if="showInbox"
      :items="inboxItems"
      :subjects="subjects"
      @close="showInbox = false"
    />

    <SectionHomeQuickMenu @action="onQuickAction" />
  </div>
</template>

<style scoped>
.boot {
  max-width: 720px;
  margin: 0 auto;
  padding: 80px 16px;
  text-align: center;
  color: var(--pt-ink-muted);
  font-size: calc(14px * var(--pt-text-scale));
}
.home {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--pt-pad-screen) 16px 64px;
  display: flex;
  flex-direction: column;
  gap: var(--pt-gap-screen);
}
</style>
