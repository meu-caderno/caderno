<script setup lang="ts">
import type { Activity, Id, Subject } from "@meu-caderno/core";
import { useCaderno } from "~/composables/useCaderno";

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
  subjects,
  today,
  todayLabel,
  ready,
  booting,
} = useCaderno();

const { service } = useCadernoService();
const { toast } = useToast();
const { reviewing, close: closeOnboarding } = useOnboarding();
const { homeWidgets, isVisible } = useLayout();
const showWidget = (key: string) => isVisible(homeWidgets.value, key);

const {
  show: showWelcome,
  check: checkWelcome,
  dismiss: dismissWelcome,
} = useWelcomeBack();
watch(today, (value) => checkWelcome(value), { immediate: true });

const creatingContext = ref(false);
const editingContext = ref(false);
const creatingSubject = ref(false);
const editingSubject = ref<Subject | null>(null);
const deletingSubject = ref<Subject | null>(null);
const creatingActivity = ref(false);
const editingActivity = ref<Activity | null>(null);
const capturing = ref(false);
const showInbox = ref(false);
const notasSubjectId = ref<Id | null>(null);
const detailSubjectId = ref<Id | null>(null);

const notasSubject = computed(
  () =>
    subjects.value.find((subject) => subject.id === notasSubjectId.value) ??
    null,
);
const detailStat = computed(
  () =>
    stats.value.find((stat) => stat.subject.id === detailSubjectId.value) ??
    null,
);

function startEditSubject() {
  const subject = detailStat.value?.subject;
  if (!subject) return;
  detailSubjectId.value = null;
  editingSubject.value = subject;
}

function askDeleteSubject() {
  const subject = detailStat.value?.subject;
  if (!subject) return;
  detailSubjectId.value = null;
  deletingSubject.value = subject;
}

async function confirmDeleteSubject() {
  const subject = deletingSubject.value;
  deletingSubject.value = null;
  if (!subject) return;
  const res = await service.deleteSubject(subject.id);
  if (res.ok) toast({ title: `${subject.name} excluída` });
}

const quickActions: Record<string, () => void> = {
  capture: () => {
    capturing.value = true;
  },
  inbox: () => {
    showInbox.value = true;
  },
  activity: () => {
    creatingActivity.value = true;
  },
  subject: () => {
    creatingSubject.value = true;
  },
  context: () => {
    creatingContext.value = true;
  },
};
function onQuickAction(action: string) {
  quickActions[action]?.();
}

function onKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    capturing.value = true;
  }
}
onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => window.removeEventListener("keydown", onKeydown));

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
    <SectionHomeTodayRoll
      v-if="showWidget('roll')"
      :roll="roll"
      :date-label="todayLabel"
      @mark="mark"
    />
    <SectionHomeRiskAlert
      v-if="showWidget('risk')"
      :stats="stats"
      @detail="detailSubjectId = $event"
    />
    <SectionHomeSubjectsSection
      v-if="showWidget('subjects')"
      :stats="stats"
      @create="creatingSubject = true"
      @notas="notasSubjectId = $event"
      @detail="detailSubjectId = $event"
    />
    <SectionHomeActivitiesSection
      v-if="showWidget('activities')"
      :activities="pendingActivities"
      :subjects="subjects"
      :stats="stats"
      :today="today"
      @complete="completeActivity"
      @create="creatingActivity = true"
      @edit="editingActivity = $event"
    />

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
      @done="creatingActivity = false"
      @cancel="creatingActivity = false"
    />
    <SectionHomeActivityForm
      v-if="editingActivity"
      :subjects="subjects"
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
