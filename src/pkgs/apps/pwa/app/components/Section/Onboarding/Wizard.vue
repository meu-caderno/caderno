<script setup lang="ts">
import type { Id, Modules } from "@meu-caderno/core";
import { AbsenceStance, Goal, Link } from "@meu-caderno/core";

defineProps<{ reviewing?: boolean }>();
const emit = defineEmits<{ done: []; cancel: [] }>();

const { service, config } = useCadernoService();
const { setActive } = useActiveContext();
const { seedDemo } = useDemoSeed();

type StepName = "welcome" | "goal" | "context" | "attendance" | "profile";
const step = ref<StepName>("welcome");

const draft = reactive({
  goals: [] as string[],
  name: "",
  link: Link.PERSONAL as string,
  nature: "",
  stance: AbsenceStance.PLAN_ABSENCES as string,
  floor: 75,
  profile: "calmo",
});

const MODULE_PRESET: Record<string, Partial<Modules>> = {
  [Goal.UNIVERSITY]: { attendance: true, grades: true, term: true },
  [Goal.PUBLIC_EXAM]: { grades: true, term: true, syllabus: true },
  [Goal.OPEN_COURSE]: { certificate: true },
  [Goal.FREE_STUDY]: { streak: true, hours: true },
};

const wantsAttendance = computed(() => draft.goals.includes(Goal.UNIVERSITY));

function buildModules(): Modules {
  const modules: Modules = {
    attendance: false,
    grades: false,
    term: false,
    streak: false,
    hours: false,
    syllabus: false,
    certificate: false,
  };
  for (const goal of draft.goals)
    Object.assign(modules, MODULE_PRESET[goal] ?? {});
  return modules;
}

function goForward() {
  if (step.value === "goal") step.value = "context";
  else if (step.value === "context")
    step.value = wantsAttendance.value ? "attendance" : "profile";
  else if (step.value === "attendance") step.value = "profile";
}

function goBack() {
  if (step.value === "context") step.value = "goal";
  else if (step.value === "attendance") step.value = "context";
  else if (step.value === "profile")
    step.value = wantsAttendance.value ? "attendance" : "context";
  else step.value = "welcome";
}

async function finishContext(id: Id) {
  await setActive(id);
  await config.preferences.put({
    id: "default" as Id,
    activeContextId: id,
    homeProfile: draft.profile,
  });
  emit("done");
}

async function createFromDraft() {
  const result = await service.createContext({
    name: draft.name.trim() || "Meus estudos",
    goal: (draft.goals[0] as Goal) ?? Goal.NONE,
    link: draft.link as Link,
    absenceStance: draft.stance as AbsenceStance,
    attendanceFloor: wantsAttendance.value ? draft.floor / 100 : undefined,
    nature: draft.nature.trim() || undefined,
    modules: buildModules(),
  });
  if (result.ok) await finishContext(result.value.id);
}

async function skipSetup() {
  const result = await service.createContext({
    name: "Meus estudos",
    goal: Goal.NONE,
    link: Link.PERSONAL,
    absenceStance: AbsenceStance.PLAN_ABSENCES,
    modules: buildModules(),
  });
  if (result.ok) {
    await setActive(result.value.id);
    emit("done");
  }
}

async function startDemo() {
  await seedDemo();
  emit("done");
}
</script>

<template>
  <div class="wizard">
    <div class="wizard__bar">
      <button
        v-if="step !== 'welcome'"
        type="button"
        class="wizard__back"
        @click="goBack"
      >
        <UIIcon icon="chevron-left" :size="16" /> voltar
      </button>
      <button
        v-if="reviewing"
        type="button"
        class="wizard__close"
        @click="emit('cancel')"
      >
        fechar <UIIcon icon="x" :size="16" />
      </button>
    </div>

    <SectionOnboardingWelcomeStep
      v-if="step === 'welcome'"
      @start="step = 'goal'"
      @demo="startDemo"
      @skip="skipSetup"
    />
    <SectionOnboardingGoalStep
      v-else-if="step === 'goal'"
      v-model:goals="draft.goals"
      @next="goForward"
      @back="goBack"
    />
    <SectionOnboardingContextStep
      v-else-if="step === 'context'"
      v-model:name="draft.name"
      v-model:link="draft.link"
      v-model:nature="draft.nature"
      @next="goForward"
      @back="goBack"
    />
    <SectionOnboardingAttendanceStep
      v-else-if="step === 'attendance'"
      v-model:stance="draft.stance"
      v-model:floor="draft.floor"
      @next="goForward"
      @back="goBack"
    />
    <SectionOnboardingProfileStep
      v-else
      v-model:profile="draft.profile"
      @finish="createFromDraft"
      @back="goBack"
    />
  </div>
</template>

<style scoped>
.wizard {
  max-width: 460px;
  margin: 0 auto;
  padding: 32px 16px 64px;
}
.wizard__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 28px;
  margin-bottom: 12px;
}
.wizard__back,
.wizard__close {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: var(--pt-ink-muted);
  cursor: pointer;
  padding: 0;
}
.wizard__close {
  margin-left: auto;
}
</style>
