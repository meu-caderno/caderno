<script setup lang="ts">
import { AttendanceStatus, type Subject } from "@meu-caderno/core";
import { formatDay, type SubjectStats } from "~/utils/caderno-stats";

const props = defineProps<{ stat: SubjectStats }>();
const emit = defineEmits<{ close: []; notas: []; edit: []; delete: [] }>();

const subject = computed(() => props.stat.subject);
const marking = ref(false);

function buildRuleLines(item: Subject, floorPct: number): string[] {
  return [
    `Cada aula vale ${item.hoursPerClass} hora-aula`,
    `Piso de frequência ${floorPct}%`,
    "Aula cancelada ou feriado não conta falta",
    item.medicalExcuses
      ? "Atestado abona a falta"
      : "Atestado conta como falta",
    item.lateIsHalf ? "Atraso conta como ½ falta" : "Atraso conta falta cheia",
  ];
}

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
const floorPct = computed(() => Math.round(props.stat.floor * 100));
const ruleLines = computed(() => buildRuleLines(subject.value, floorPct.value));
const budget = computed(() => ({
  used: Math.max(props.stat.faltasUsadas, 0),
  max: Math.max(props.stat.maxFaltas, 0),
}));
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
          :caption="`piso ${floorPct}%`"
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

      <div class="subject-detail__budget">
        <div class="subject-detail__budget-head">
          <span>Orçamento de faltas</span>
          <span class="subject-detail__budget-n">
            {{ budget.used }} / {{ budget.max }}
          </span>
        </div>
        <UIProgress
          :value="budget.used"
          :max="budget.max || 1"
          :color="stat.status.color"
        />
      </div>

      <div v-if="stat.heat.length" class="subject-detail__heat">
        <div class="pt-eyebrow">Ritmo de presença</div>
        <UIHeatmap :cells="stat.heat" :cell-size="14" />
      </div>

      <div class="subject-detail__rule">
        <div class="subject-detail__rule-title">📐 Regra de faltas</div>
        <ul class="subject-detail__rule-list">
          <li v-for="line in ruleLines" :key="line">{{ line }}</li>
        </ul>
      </div>

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
.subject-detail__budget {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.subject-detail__budget-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: calc(13px * var(--pt-text-scale));
  font-weight: 600;
  color: var(--pt-ink-soft);
}
.subject-detail__budget-n {
  font-variant-numeric: tabular-nums;
}
.subject-detail__heat {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.subject-detail__rule {
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink-soft);
  padding: 10px 12px;
  border-radius: var(--pt-radius-sm);
  background: var(--pt-card);
}
.subject-detail__rule-title {
  font-weight: 700;
  color: var(--pt-ink);
  margin-bottom: 6px;
}
.subject-detail__rule-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.subject-detail__rule-list li {
  position: relative;
  padding-left: 14px;
  line-height: 1.4;
}
.subject-detail__rule-list li::before {
  content: "·";
  position: absolute;
  left: 4px;
  font-weight: 800;
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
