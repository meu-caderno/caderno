<script setup lang="ts">
import type { Activity, DayIso, Id, Subject, Subtask } from "@meu-caderno/core";
import {
  ActivityKind,
  ActivityStatus,
  Recurrence,
  Root,
} from "@meu-caderno/core";
import {
  moveByOffset,
  reorderByEdge,
  type SortableMovePayload,
  type SortablePayload,
} from "~/utils/sortable";

const props = defineProps<{
  subjects: Subject[];
  activity?: Activity;
  activities?: Activity[];
}>();
const emit = defineEmits<{ done: []; cancel: [] }>();

const { service, ids } = useCadernoService();
const { effectiveId } = useActiveContext();

const editing = computed(() => props.activity != null);

const kindOptions = [
  { value: ActivityKind.TASK, label: "Tarefa" },
  { value: ActivityKind.EXAM, label: "Prova" },
  { value: ActivityKind.ASSIGNMENT, label: "Trabalho" },
  { value: ActivityKind.READING, label: "Leitura" },
  { value: ActivityKind.CAPTURE, label: "Captura rápida" },
];
const subjectOptions = computed(() => [
  { value: "", label: "— sem disciplina —" },
  ...props.subjects.map((subject) => ({
    value: subject.id as string,
    label: subject.name,
  })),
]);
const recurrenceOptions = [
  { value: Recurrence.NONE, label: "Não repete" },
  { value: Recurrence.WEEKLY, label: "Semanal" },
  { value: Recurrence.BIWEEKLY, label: "Quinzenal" },
];
const gapPresets = [
  { value: 1, label: "1 dia" },
  { value: 3, label: "3 dias" },
  { value: 7, label: "1 semana" },
  { value: 14, label: "2 semanas" },
];

const title = ref(props.activity?.title ?? "");
const subjectId = ref<string>(props.activity?.subjectId ?? "");
const kind = ref<string>(props.activity?.kind ?? ActivityKind.TASK);
const due = ref(props.activity?.dueDate ?? "");
const recurrence = ref<string>(props.activity?.recurrence ?? Recurrence.NONE);
const subtasks = ref<Subtask[]>([...(props.activity?.subtasks ?? [])]);
const newSubtask = ref("");
const saving = ref(false);

const isPreparation = ref(props.activity?.preparesId != null);
const preparesId = ref<string>(props.activity?.preparesId ?? "");
const gapDays = ref<number>(props.activity?.gapDays ?? 3);

const preparationTargets = computed(() => [
  { value: "", label: "— escolha a atividade —" },
  ...(props.activities ?? [])
    .filter(
      (candidate) =>
        candidate.id !== props.activity?.id && candidate.dueDate != null,
    )
    .map((candidate) => ({
      value: candidate.id as string,
      label: candidate.title,
    })),
]);

function setGap(value: number) {
  gapDays.value = value;
}

async function addSubtask() {
  const text = newSubtask.value.trim();
  if (!text) return;
  subtasks.value.push({ id: await ids.newId(), text, done: false });
  newSubtask.value = "";
}
function toggleSubtask(id: Id) {
  const task = subtasks.value.find((subtask) => subtask.id === id);
  if (task) task.done = !task.done;
}
function removeSubtask(id: Id) {
  subtasks.value = subtasks.value.filter((subtask) => subtask.id !== id);
}
function onReorderSubtasks({ fromId, toId, edge }: SortablePayload) {
  subtasks.value = reorderByEdge(
    subtasks.value,
    fromId,
    toId,
    edge,
    (task) => task.id,
  );
}
function onMoveSubtask({ id, direction }: SortableMovePayload) {
  subtasks.value = moveByOffset(
    subtasks.value,
    id,
    direction,
    (task) => task.id,
  );
}

function editableFields() {
  const prepares = isPreparation.value && preparesId.value;
  return {
    subjectId: subjectId.value ? (subjectId.value as Id) : undefined,
    kind: kind.value as ActivityKind,
    dueDate: due.value ? (due.value as DayIso) : undefined,
    recurrence:
      recurrence.value === Recurrence.NONE
        ? undefined
        : (recurrence.value as Recurrence),
    subtasks: subtasks.value.length ? subtasks.value : undefined,
    preparesId: prepares ? (preparesId.value as Id) : undefined,
    gapDays: prepares ? gapDays.value : undefined,
  };
}

async function save() {
  const trimmed = title.value.trim();
  if (!trimmed || saving.value) return;
  saving.value = true;
  const base = props.activity ?? {
    id: await ids.newId(),
    contextId: effectiveId.value ?? undefined,
    status: ActivityStatus.OPEN,
    root: Root.CONTEXT,
  };
  const res = await service.upsertActivity({
    ...base,
    title: trimmed,
    ...editableFields(),
  });
  saving.value = false;
  if (res.ok) emit("done");
}
</script>

<template>
  <UIModal
    :title="editing ? 'Editar atividade' : 'Nova atividade'"
    subtitle="prova, lista, trabalho…"
    @close="emit('cancel')"
  >
    <div class="af">
      <UIField label="Título">
        <input
          v-model="title"
          class="af__input"
          type="text"
          placeholder="Ex.: Lista 4 de Cálculo"
          @keyup.enter="save"
        />
      </UIField>
      <UIField label="Disciplina">
        <UISelect
          v-model="subjectId"
          :options="subjectOptions"
          placeholder="— sem disciplina —"
        />
      </UIField>
      <UIField label="Tipo">
        <UISelect v-model="kind" :options="kindOptions" />
      </UIField>
      <UIField label="Data de entrega">
        <input v-model="due" class="af__input" type="date" />
      </UIField>
      <UIField v-if="due" label="Recorrência">
        <div class="af__chips">
          <UIChip
            v-for="option in recurrenceOptions"
            :key="option.value"
            :label="option.label"
            :selected="recurrence === option.value"
            @click="recurrence = option.value"
          />
        </div>
      </UIField>

      <UIField label="Subtarefas">
        <div class="af__subtasks">
          <UISortable @reorder="onReorderSubtasks" @move="onMoveSubtask">
            <UISortableItem
              v-for="task in subtasks"
              :id="task.id"
              :key="task.id"
            >
              <div class="af__subtask">
                <UICheckbox
                  :model-value="task.done"
                  :label="task.text"
                  @update:model-value="toggleSubtask(task.id)"
                />
                <button
                  type="button"
                  class="af__subtask-x"
                  aria-label="Remover subtarefa"
                  @click="removeSubtask(task.id)"
                >
                  <UIIcon icon="x" :size="14" />
                </button>
              </div>
            </UISortableItem>
          </UISortable>
          <div class="af__subtask-add">
            <input
              v-model="newSubtask"
              class="af__input"
              type="text"
              placeholder="Nova subtarefa"
              @keyup.enter="addSubtask"
            />
            <UIButton
              variant="fantasma"
              icon="plus"
              label="Add"
              @click="addSubtask"
            />
          </div>
        </div>
      </UIField>

      <UISwitch
        v-model="isPreparation"
        label="📚 É preparação para outra atividade"
        hint="vincula esta tarefa a uma entrega futura (ler antes da prova, etc.)"
      />
      <template v-if="isPreparation">
        <UIField label="Para qual atividade">
          <UISelect v-model="preparesId" :options="preparationTargets" />
        </UIField>
        <UIField label="Dias antes do prazo">
          <div class="af__gap">
            <div class="af__chips">
              <UIChip
                v-for="preset in gapPresets"
                :key="preset.value"
                :label="preset.label"
                :selected="gapDays === preset.value"
                @click="setGap(preset.value)"
              />
            </div>
            <UINumberField v-model="gapDays" :min="0" :max="60" :step="1" />
          </div>
        </UIField>
      </template>

      <div class="af__actions">
        <UIButton variant="fantasma" label="Cancelar" @click="emit('cancel')" />
        <UIButton
          variant="primal"
          icon="check"
          :label="
            saving
              ? 'Salvando…'
              : editing
                ? 'Salvar alterações'
                : 'Criar atividade'
          "
          @click="save"
        />
      </div>
    </div>
  </UIModal>
</template>

<style scoped>
.af {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.af__input {
  font-family: inherit;
  font-size: calc(15px * var(--pt-text-scale));
  padding: 10px 12px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink);
  width: 100%;
}
.af__input:focus {
  outline: none;
  border-color: var(--pt-ink);
}
.af__subtasks {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.af__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.af__gap {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
.af__subtask {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.af__subtask-x {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: var(--pt-radius-sm);
  border: none;
  background: var(--pt-card);
  color: var(--pt-ink-muted);
  cursor: pointer;
}
.af__subtask-add {
  display: flex;
  align-items: center;
  gap: 8px;
}
.af__subtask-add .af__input {
  flex: 1;
}
.af__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}
</style>
