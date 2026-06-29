<script setup lang="ts">
import type { DayIso, Subject } from "@meu-caderno/core";
import { AttendanceStatus } from "@meu-caderno/core";

const props = defineProps<{ subject: Subject }>();
const emit = defineEmits<{ done: []; close: [] }>();

const { service, clock } = useCadernoService();

const day = ref("");
const status = ref<string>(AttendanceStatus.ABSENT);
const saving = ref(false);

onMounted(async () => {
  day.value = await clock.today();
});

const statusOptions = [
  { value: AttendanceStatus.PRESENT, label: "Presente" },
  { value: AttendanceStatus.ABSENT, label: "Falta" },
  { value: AttendanceStatus.LATE, label: "Atraso" },
  { value: AttendanceStatus.MEDICAL, label: "Atestado" },
  { value: AttendanceStatus.WAIVED, label: "Abono" },
  { value: AttendanceStatus.HOLIDAY, label: "Feriado" },
  { value: AttendanceStatus.CANCELED, label: "Cancelada" },
];

async function save() {
  if (!day.value || saving.value) return;
  saving.value = true;
  await service.markAttendance({
    subjectId: props.subject.id,
    day: day.value as DayIso,
    status: status.value as AttendanceStatus,
  });
  saving.value = false;
  emit("done");
}
</script>

<template>
  <UIModal
    title="Registrar presença"
    :subtitle="subject.name"
    @close="emit('close')"
  >
    <div class="marker">
      <UIField label="Dia">
        <input v-model="day" class="marker__input" type="date" />
      </UIField>
      <UIField label="O que aconteceu?">
        <UIToggleGroup v-model="status" :options="statusOptions" />
      </UIField>
      <p class="marker__hint">
        Atestado/abono não contam como falta · feriado e aula cancelada reduzem a
        carga.
      </p>
      <div class="marker__actions">
        <UIButton variant="fantasma" label="Cancelar" @click="emit('close')" />
        <UIButton
          variant="primal"
          icon="check"
          :label="saving ? 'Salvando…' : 'Registrar'"
          @click="save"
        />
      </div>
    </div>
  </UIModal>
</template>

<style scoped>
.marker {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.marker__input {
  font-family: inherit;
  font-size: 15px;
  padding: 10px 12px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink);
  width: 100%;
}
.marker__input:focus {
  outline: none;
  border-color: var(--pt-ink);
}
.marker__hint {
  font-size: 12px;
  line-height: 1.4;
  color: var(--pt-ink-muted);
  margin: -4px 0 0;
}
.marker__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}
</style>
