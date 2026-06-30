import type { Activity, Id, Subject } from "@meu-caderno/core";
import type { Ref } from "vue";
import type { SubjectStats } from "~/utils/caderno-stats";

export interface HomeDialogsInput {
  subjects: Ref<Subject[]>;
  stats: Ref<SubjectStats[]>;
}

export function useHomeDialogs(input: HomeDialogsInput) {
  const { service } = useCadernoService();
  const { toast } = useToast();
  const { open: openFocus } = useFocus();

  const creatingContext = ref(false);
  const editingContext = ref(false);
  const creatingSubject = ref(false);
  const editingSubject = ref<Subject | null>(null);
  const deletingSubject = ref<Subject | null>(null);
  const creatingActivity = ref(false);
  const editingActivity = ref<Activity | null>(null);
  const managingGoals = ref(false);
  const capturing = ref(false);
  const showInbox = ref(false);
  const notasSubjectId = ref<Id | null>(null);
  const detailSubjectId = ref<Id | null>(null);

  const notasSubject = computed(
    () =>
      input.subjects.value.find(
        (subject) => subject.id === notasSubjectId.value,
      ) ?? null,
  );
  const detailStat = computed(
    () =>
      input.stats.value.find(
        (stat) => stat.subject.id === detailSubjectId.value,
      ) ?? null,
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
    const result = await service.deleteSubject(subject.id);
    if (result.ok) toast({ title: `${subject.name} excluída` });
  }

  const quickActions: Record<string, () => void> = {
    capture: () => {
      capturing.value = true;
    },
    inbox: () => {
      showInbox.value = true;
    },
    focus: () => {
      openFocus();
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

  return {
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
  };
}
