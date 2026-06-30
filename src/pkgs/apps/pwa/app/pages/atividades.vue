<script setup lang="ts">
import type { Activity, DayIso, Id } from "@meu-caderno/core";
import { ActivityStatus } from "@meu-caderno/core";
import type {
  ActivityFilter,
  ActivityGroupBy,
} from "~/utils/activities-filter";
import { filterActivities, groupActivities } from "~/utils/activities-filter";

const { activities, subjects, stats, today, completeActivity } = useCaderno();
const { service } = useCadernoService();
const { toast } = useToast();

const FILTERS: { value: ActivityFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "open", label: "Pendentes" },
  { value: "done", label: "Entregues" },
];
const GROUPINGS: { value: ActivityGroupBy; label: string }[] = [
  { value: "due", label: "Prazo" },
  { value: "subject", label: "Disciplina" },
  { value: "kind", label: "Tipo" },
];

const filter = ref<ActivityFilter>("all");
const groupBy = ref<ActivityGroupBy>("due");
const selecting = ref(false);
const selectedIds = ref<Id[]>([]);

const filtered = computed(() =>
  filterActivities(activities.value, filter.value),
);
const groups = computed(() =>
  groupActivities(filtered.value, groupBy.value, {
    today: today.value as DayIso,
    subjects: subjects.value,
  }),
);

const selectedCount = computed(() => selectedIds.value.length);
const showBatchBar = computed(() => selecting.value && selectedCount.value > 0);

function subjectName(id?: string) {
  return subjects.value.find((subject) => subject.id === id)?.name;
}
function subjectColor(id?: string) {
  return stats.value.find((stat) => stat.subject.id === id)?.status.color;
}

function isSelected(id: Id) {
  return selectedIds.value.includes(id);
}
function toggleSelected(id: Id) {
  selectedIds.value = isSelected(id)
    ? selectedIds.value.filter((value) => value !== id)
    : [...selectedIds.value, id];
}
function toggleSelecting() {
  selecting.value = !selecting.value;
  if (!selecting.value) selectedIds.value = [];
}

function selectedActivities(): Activity[] {
  const chosen = new Set(selectedIds.value);
  return activities.value.filter((activity) => chosen.has(activity.id));
}

async function completeSelected() {
  const rows = selectedActivities();
  for (const activity of rows) {
    await service.upsertActivity({ ...activity, status: ActivityStatus.DONE });
  }
  toggleSelecting();
  toast({
    title: `${rows.length} concluída(s)`,
    actionLabel: "desfazer",
    onAction: () => {
      for (const activity of rows) {
        void service.upsertActivity({
          ...activity,
          status: ActivityStatus.OPEN,
        });
      }
    },
  });
}

async function deleteSelected() {
  const rows = selectedActivities();
  for (const activity of rows) {
    await service.deleteActivity(activity.id);
  }
  toggleSelecting();
  toast({ title: `${rows.length} excluída(s)` });
}
</script>

<template>
  <div class="atividades">
    <SectionPageHeader
      title="Atividades"
      :subtitle="`${filtered.length} atividades`"
    >
      <template #actions>
        <UIButton
          :variant="selecting ? 'leve' : 'fantasma'"
          icon="check"
          :label="selecting ? 'Concluído' : 'Selecionar'"
          @click="toggleSelecting"
        />
      </template>
    </SectionPageHeader>

    <div class="atividades__filters">
      <UIChip
        v-for="option in FILTERS"
        :key="option.value"
        :label="option.label"
        :selected="filter === option.value"
        @click="filter = option.value"
      />
    </div>
    <div class="atividades__group">
      <span class="atividades__group-label">Agrupar</span>
      <UIChip
        v-for="option in GROUPINGS"
        :key="option.value"
        :label="option.label"
        :selected="groupBy === option.value"
        @click="groupBy = option.value"
      />
    </div>

    <UIEmptyState
      v-if="!filtered.length"
      icon="🗂️"
      title="Nenhuma atividade"
      subtitle="Ajuste os filtros ou capture novas atividades."
    />
    <div v-else class="atividades__groups">
      <section
        v-for="group in groups"
        :key="group.key"
        class="atividades__section"
      >
        <div class="atividades__section-head">
          <span class="atividades__section-title">{{ group.label }}</span>
          <span class="atividades__section-count">{{ group.rows.length }}</span>
        </div>
        <div
          v-for="activity in group.rows"
          :key="activity.id"
          class="atividades__row"
        >
          <UICheckbox
            v-if="selecting"
            :model-value="isSelected(activity.id)"
            @update:model-value="toggleSelected(activity.id)"
          />
          <SectionHomeActivityItem
            class="atividades__item"
            :activity="activity"
            :subject-name="subjectName(activity.subjectId)"
            :subject-color="subjectColor(activity.subjectId)"
            :today="today"
            @complete="completeActivity(activity)"
          />
        </div>
      </section>
    </div>

    <div v-if="showBatchBar" class="atividades__batch">
      <span class="atividades__batch-count">
        {{ selectedCount }} selecionada(s)
      </span>
      <div class="atividades__batch-actions">
        <UIButton
          variant="primal"
          icon="check"
          label="Concluir"
          @click="completeSelected"
        />
        <UIButton
          variant="perigo"
          icon="trash"
          label="Excluir"
          @click="deleteSelected"
        />
        <UIButton variant="fantasma" icon="x" label="Cancelar" @click="toggleSelecting" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.atividades {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--pt-pad-screen) 16px 96px;
  display: flex;
  flex-direction: column;
  gap: calc(14px * var(--pt-density));
  container-type: inline-size;
}
.atividades__filters,
.atividades__group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.atividades__group-label {
  font-size: calc(13px * var(--pt-text-scale));
  font-weight: 600;
  color: var(--pt-ink-muted);
}
.atividades__groups {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.atividades__section {
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.atividades__section-head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.atividades__section-title {
  font-size: calc(12px * var(--pt-text-scale));
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--pt-ink-muted);
}
.atividades__section-count {
  font-size: calc(11px * var(--pt-text-scale));
  font-weight: 700;
  color: var(--pt-ink-muted);
  background: var(--pt-card);
  padding: 1px 7px;
  border-radius: var(--pt-radius-pill);
}
.atividades__row {
  display: flex;
  align-items: center;
  gap: 11px;
}
.atividades__item {
  flex: 1;
  min-width: 0;
}
.atividades__batch {
  position: fixed;
  left: 50%;
  bottom: 16px;
  transform: translateX(-50%);
  z-index: 20;
  width: min(680px, calc(100% - 24px));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 16px;
  border-radius: var(--pt-radius-lg);
  background: var(--pt-card);
  border: var(--pt-stroke) solid var(--pt-border);
  box-shadow: var(--pt-shadow-strong);
}
.atividades__batch-count {
  font-size: calc(14px * var(--pt-text-scale));
  font-weight: 700;
  color: var(--pt-ink);
}
.atividades__batch-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
