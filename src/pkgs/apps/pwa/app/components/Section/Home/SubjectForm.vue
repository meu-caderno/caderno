<script setup lang="ts">
import type { Color, Subject } from "@meu-caderno/core";
import { ScheduleKind } from "@meu-caderno/core";

const props = defineProps<{ subject?: Subject }>();
const emit = defineEmits<{ done: []; cancel: [] }>();

const { service } = useCadernoService();
const { effectiveId } = useActiveContext();

const colors = [
  "#c0392b",
  "#3f6fb0",
  "#2f7d4f",
  "#b8862b",
  "#7d5ba6",
  "#2c8c8c",
];
const weekdayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const editing = computed(() => props.subject != null);

const name = ref(props.subject?.name ?? "");
const color = ref<string>(props.subject?.color ?? colors[0] ?? "#c0392b");
const weekdays = ref<number[]>([...(props.subject?.schedule?.weekdays ?? [])]);
const start = ref(props.subject?.schedule?.blocks?.[0]?.start ?? "08:00");
const end = ref(props.subject?.schedule?.blocks?.[0]?.end ?? "09:40");
const credits = ref<number | null>(props.subject?.credits ?? null);
const floor = ref(Math.round((props.subject?.floor ?? 0.75) * 100));
const lateIsHalf = ref(props.subject?.lateIsHalf ?? true);
const medicalExcuses = ref(props.subject?.medicalExcuses ?? true);
const saving = ref(false);

function toggleDay(weekday: number) {
  const index = weekdays.value.indexOf(weekday);
  if (index >= 0) weekdays.value.splice(index, 1);
  else weekdays.value.push(weekday);
}

async function save() {
  const trimmed = name.value.trim();
  if (!trimmed || saving.value || !effectiveId.value) return;
  saving.value = true;
  const schedule = weekdays.value.length
    ? {
        kind: ScheduleKind.WEEKLY,
        weekdays: [...weekdays.value].sort((left, right) => left - right),
        blocks: [{ start: start.value, end: end.value }],
      }
    : undefined;
  const fields = {
    name: trimmed,
    color: (color.value ?? colors[0]) as Color,
    credits: credits.value ?? undefined,
    floor: floor.value / 100,
    lateIsHalf: lateIsHalf.value,
    medicalExcuses: medicalExcuses.value,
    schedule,
  };
  const res = props.subject
    ? await service.updateSubject({ ...props.subject, ...fields })
    : await service.createSubject({
        contextId: effectiveId.value,
        hoursPerClass: 1,
        classesPerSession: 2,
        ...fields,
      });
  saving.value = false;
  if (res.ok) emit("done");
}
</script>

<template>
  <UIModal
    :title="editing ? 'Editar disciplina' : 'Nova disciplina'"
    subtitle="defina carga e regra de faltas"
    @close="emit('cancel')"
  >
    <div class="sf">
      <label class="sf__label" for="sf-name">Nome</label>
      <input
        id="sf-name"
        v-model="name"
        class="sf__input"
        type="text"
        placeholder="Ex.: Cálculo II"
        @keyup.enter="save"
      />

      <label class="sf__label">Cor</label>
      <div class="sf__colors">
        <button
          v-for="colorOption in colors"
          :key="colorOption"
          type="button"
          class="sf__color"
          :class="{ 'sf__color--on': color === colorOption }"
          :style="{ background: colorOption }"
          :aria-label="`Cor ${colorOption}`"
          @click="color = colorOption"
        />
      </div>

      <label class="sf__label">Dias de aula</label>
      <div class="sf__days">
        <button
          v-for="(lbl, d) in weekdayLabels"
          :key="d"
          type="button"
          class="sf__day"
          :class="{ 'sf__day--on': weekdays.includes(d) }"
          @click="toggleDay(d)"
        >
          {{ lbl }}
        </button>
      </div>

      <div v-if="weekdays.length" class="sf__time">
        <div class="sf__time-field">
          <label class="sf__label" for="sf-start">Início</label>
          <input id="sf-start" v-model="start" class="sf__input" type="time" />
        </div>
        <div class="sf__time-field">
          <label class="sf__label" for="sf-end">Fim</label>
          <input id="sf-end" v-model="end" class="sf__input" type="time" />
        </div>
      </div>

      <div class="sf__row">
        <div class="sf__col">
          <label class="sf__label" for="sf-credits">Créditos</label>
          <input
            id="sf-credits"
            v-model.number="credits"
            class="sf__input"
            type="number"
            min="0"
            placeholder="opcional"
          />
          <span class="sf__hint">preenche a carga horária</span>
        </div>
        <div class="sf__col">
          <label class="sf__label" for="sf-floor">Piso de frequência</label>
          <div class="sf__floor">
            <input
              id="sf-floor"
              v-model.number="floor"
              class="sf__input"
              type="number"
              min="1"
              max="100"
            />
            <span class="sf__pct">%</span>
          </div>
        </div>
      </div>

      <label class="sf__label">Regra de faltas</label>
      <div class="sf__rules">
        <UISwitch v-model="medicalExcuses" label="Atestado abona a falta" />
        <UISwitch v-model="lateIsHalf" label="Atraso conta como ½ falta" />
      </div>

      <div class="sf__actions">
        <UIButton variant="fantasma" label="Cancelar" @click="emit('cancel')" />
        <UIButton
          variant="primal"
          icon="check"
          :label="
            saving
              ? 'Salvando…'
              : editing
                ? 'Salvar alterações'
                : 'Criar disciplina'
          "
          @click="save"
        />
      </div>
    </div>
  </UIModal>
</template>

<style scoped>
.sf__rules {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 0;
}
.sf {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.sf__label {
  font-size: calc(13px * var(--pt-text-scale));
  font-weight: 600;
  margin-top: 8px;
}
.sf__input {
  font-family: inherit;
  font-size: calc(15px * var(--pt-text-scale));
  padding: 10px 12px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink);
  width: 100%;
}
.sf__input:focus {
  outline: none;
  border-color: var(--pt-ink);
}
.sf__hint {
  font-size: calc(11px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
.sf__colors {
  display: flex;
  gap: 8px;
}
.sf__color {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
}
.sf__color--on {
  border-color: var(--pt-ink);
  box-shadow: 0 0 0 2px var(--pt-paper) inset;
}
.sf__days {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}
.sf__day {
  font-family: inherit;
  font-size: calc(12px * var(--pt-text-scale));
  font-weight: 600;
  padding: 8px 10px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink-soft);
  cursor: pointer;
}
.sf__day--on {
  border-color: var(--pt-ink);
  background: var(--pt-paper);
  color: var(--pt-ink);
}
.sf__time,
.sf__row {
  display: flex;
  gap: 10px;
}
.sf__time-field,
.sf__col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.sf__floor {
  display: flex;
  align-items: center;
  gap: 6px;
}
.sf__floor .sf__input {
  width: 72px;
}
.sf__pct {
  font-size: calc(14px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
.sf__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}
</style>
