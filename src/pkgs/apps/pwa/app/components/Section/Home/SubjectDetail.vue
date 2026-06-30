<script setup lang="ts">
import { AttendanceStatus } from "@meu-caderno/core";
import { formatDay, type SubjectStats } from "~/utils/caderno-stats";

const props = defineProps<{ stat: SubjectStats }>();
const emit = defineEmits<{ close: []; notas: []; edit: []; delete: [] }>();

const subject = computed(() => props.stat.subject);
const marking = ref(false);

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: "Presente",
  [AttendanceStatus.ABSENT]: "Falta",
  [AttendanceStatus.LATE]: "Atraso",
  [AttendanceStatus.MEDICAL]: "Atestado",
  [AttendanceStatus.WAIVED]: "Abono",
  [AttendanceStatus.HOLIDAY]: "Feriado",
  [AttendanceStatus.CANCELED]: "Cancelada",
};

const history = computed(() => [...(subject.value.records ?? [])].reverse());
const ruleLabel = computed(
  () =>
    `Cada aula vale ${subject.value.hoursPerClass} hora-aula · piso ${Math.round(
      props.stat.floor * 100,
    )}%`,
);
</script>

<template>
  <UIModal :title="subject.name" @close="emit('close')">
    <div class="subject-detail">
      <div class="subject-detail__summary">
        <div class="subject-detail__rest" :style="{ color: stat.status.color }">
          <div class="subject-detail__rest-n">
            {{ stat.restantes > 0 ? stat.restantes : 0 }}
          </div>
          <div class="subject-detail__rest-l">aulas que ainda pode faltar</div>
        </div>
        <UIProgressRing
          :value="stat.freqPct"
          :color="stat.status.color"
          :size="72"
          :stroke="8"
        />
      </div>

      <div class="subject-detail__counts">
        <div class="subject-detail__count">
          <b>{{ stat.counts.present }}</b><span>presenças</span>
        </div>
        <div class="subject-detail__count">
          <b>{{ stat.counts.absent }}</b><span>faltas</span>
        </div>
        <div class="subject-detail__count">
          <b>{{ stat.counts.late }}</b><span>atrasos</span>
        </div>
        <div class="subject-detail__count">
          <b>{{ stat.counts.medical }}</b><span>atestados</span>
        </div>
      </div>

      <div class="subject-detail__rule">📐 {{ ruleLabel }}</div>

      <SectionHomeAttendanceSimulator :stat="stat" />

      <button class="subject-detail__notas" type="button" @click="emit('notas')">
        <span>Notas & avaliações</span>
        <span class="subject-detail__notas-v">
          {{ stat.media != null ? stat.media.toFixed(1) : "—" }}
          <UIIcon icon="chevron-right" :size="15" />
        </span>
      </button>

      <UIButton
        variant="primal"
        full
        icon="check"
        label="Registrar presença"
        @click="marking = true"
      />

      <div class="subject-detail__manage">
        <UIButton
          variant="fantasma"
          icon="pencil"
          label="Editar"
          @click="emit('edit')"
        />
        <UIButton
          variant="fantasma"
          icon="trash"
          label="Excluir"
          @click="emit('delete')"
        />
      </div>

      <div v-if="history.length" class="subject-detail__history">
        <div class="pt-eyebrow">Histórico</div>
        <div
          v-for="record in history"
          :key="record.id"
          class="subject-detail__row"
        >
          <span class="subject-detail__row-day">{{ formatDay(record.day) }}</span>
          <span class="subject-detail__row-status">
            {{ STATUS_LABEL[record.status] }}
          </span>
        </div>
      </div>
    </div>

    <SectionHomeAttendanceMarker
      v-if="marking"
      :subject="subject"
      @done="marking = false"
      @close="marking = false"
    />
  </UIModal>
</template>

<style scoped>
.subject-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.subject-detail__summary {
  display: flex;
  align-items: center;
  gap: 16px;
}
.subject-detail__rest {
  flex: 1;
}
.subject-detail__rest-n {
  font-size: calc(38px * var(--pt-text-scale));
  font-weight: 800;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.subject-detail__rest-l {
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  margin-top: 4px;
}
.subject-detail__counts {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.subject-detail__count {
  text-align: center;
  padding: 10px 4px;
  border-radius: 12px;
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
}
.subject-detail__count b {
  display: block;
  font-size: calc(20px * var(--pt-text-scale));
  font-variant-numeric: tabular-nums;
}
.subject-detail__count span {
  font-size: calc(11px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
.subject-detail__rule {
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink-soft);
  padding: 10px 12px;
  border-radius: var(--pt-radius-sm);
  background: var(--pt-card);
}
.subject-detail__notas {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-family: inherit;
  font-size: calc(14px * var(--pt-text-scale));
  font-weight: 600;
  padding: 12px 14px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink);
  cursor: pointer;
}
.subject-detail__notas-v {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-variant-numeric: tabular-nums;
}
.subject-detail__manage {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.subject-detail__history {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.subject-detail__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 2px;
  border-bottom: 1.5px dashed var(--pt-border-faint);
  font-size: calc(13px * var(--pt-text-scale));
}
.subject-detail__row-status {
  font-weight: 600;
  color: var(--pt-ink-soft);
}
</style>
