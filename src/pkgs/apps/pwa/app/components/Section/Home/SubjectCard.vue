<script setup lang="ts">
import { useTheme } from "~/composables/useTheme";
import type { SubjectStats } from "~/utils/caderno-stats";

const props = defineProps<{ stat: SubjectStats }>();
const emit = defineEmits<{ notas: []; detail: [] }>();

const { screenDensity } = useTheme();
const showCounts = computed(() => screenDensity.value !== "essencial");
const showHeat = computed(() => screenDensity.value === "tudo");

const subject = computed(() => props.stat.subject);

const credits = computed(() => subject.value.credits);
const scheduleLabel = computed(() => {
  const weekdayLabels = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
  const days = (subject.value.schedule?.weekdays ?? [])
    .map((weekday) => weekdayLabels[weekday])
    .join(" · ");
  return days;
});

const headline = computed(() => {
  const remaining = props.stat.restantes;
  if (remaining <= 0) return "no limite de faltas";
  return `pode faltar ${remaining} ${remaining === 1 ? "aula" : "aulas"}`;
});

const budgetLabel = computed(
  () => `${props.stat.faltasUsadas} de ${props.stat.maxFaltas} faltas`,
);
const budgetPct = computed(() => {
  if (props.stat.maxFaltas <= 0) return "100%";
  const used = Math.min(
    100,
    (props.stat.faltasUsadas / props.stat.maxFaltas) * 100,
  );
  return `${used}%`;
});
</script>

<template>
  <UICard accent="" :pad="'17px'" radius="16px">
    <div class="sc-head">
      <span class="sc-dot" :style="{ background: subject.color }" />
      <div class="sc-title-wrap">
        <div class="sc-titlerow">
          <button class="sc-name" type="button" @click="emit('detail')">
            {{ subject.name }}
          </button>
          <UIBadge
            tone="custom"
            size="md"
            bordered
            :color="stat.status.color"
            :bg="stat.status.soft"
            :label="stat.status.label"
          />
        </div>
        <div class="sc-meta">
          <template v-if="credits">{{ credits }} créditos · {{ stat.totalHours }}h</template>
          <template v-if="scheduleLabel"> · {{ scheduleLabel }}</template>
        </div>
      </div>
    </div>

    <div class="sc-budget">
      <div class="sc-budget-num">
        <div class="sc-rest" :style="{ color: stat.status.color }">
          {{ stat.restantes > 0 ? stat.restantes : 0 }}
        </div>
        <div class="sc-rest-cap">aulas que ainda<br >pode faltar</div>
      </div>
      <div class="sc-divider" :style="{ background: stat.status.color }" />
      <UIProgressRing
        :value="stat.freqPct"
        :color="stat.status.color"
        :size="72"
        :stroke="8"
      />
      <div class="sc-floor">
        frequência atual<br >(piso {{ Math.round(stat.floor * 100) }}%)
      </div>
    </div>

    <div class="sc-bar-wrap">
      <div class="sc-bar-head">
        <span class="sc-bar-title">{{ headline }}</span>
        <span class="sc-bar-sub">{{ budgetLabel }}</span>
      </div>
      <div class="sc-bar-track" :style="{ borderColor: stat.status.color }">
        <div
          class="sc-bar-fill"
          :style="{ width: budgetPct, background: stat.status.color }"
        />
      </div>
    </div>

    <div v-if="showCounts" class="sc-counts">
      <div class="sc-count sc-count--ok">
        <div class="sc-count-n">{{ stat.counts.present }}</div>
        <div class="sc-count-l">presenças</div>
      </div>
      <div class="sc-count sc-count--danger">
        <div class="sc-count-n">{{ stat.counts.absent }}</div>
        <div class="sc-count-l">faltas</div>
      </div>
      <div class="sc-count sc-count--warn">
        <div class="sc-count-n">{{ stat.counts.late }}</div>
        <div class="sc-count-l">atrasos</div>
      </div>
      <div class="sc-count sc-count--info">
        <div class="sc-count-n">{{ stat.counts.medical }}</div>
        <div class="sc-count-l">atestados</div>
      </div>
    </div>

    <div v-if="showHeat" class="sc-heat">
      <div class="pt-eyebrow sc-heat-title">Ritmo de presença</div>
      <UIHeatmap :cells="stat.heat" :cell-size="14" :gap="4" />
    </div>

    <button class="sc-media" type="button" @click="emit('notas')">
      <template v-if="stat.media != null">
        <span class="sc-media-l">média parcial</span>
        <span class="sc-media-v">{{ stat.media.toFixed(1) }}</span>
      </template>
      <template v-else>
        <span class="sc-media-l">avaliações</span>
        <span class="sc-media-add">
          <UIIcon icon="plus" :size="13" /> adicionar
        </span>
      </template>
    </button>
  </UICard>
</template>

<style scoped>
.sc-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.sc-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 5px;
}
.sc-title-wrap {
  flex: 1;
  min-width: 0;
}
.sc-titlerow {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
}
.sc-name {
  font-size: calc(17px * var(--pt-text-scale));
  font-weight: 600;
  line-height: 1.25;
  font-family: inherit;
  background: none;
  border: none;
  padding: 0;
  color: var(--pt-ink);
  cursor: pointer;
  text-align: left;
}
.sc-meta {
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  margin-top: 2px;
}

.sc-budget {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 16px;
  flex-wrap: wrap;
}
.sc-budget-num {
  min-width: 64px;
}
.sc-rest {
  font-size: calc(34px * var(--pt-text-scale));
  font-weight: 800;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.sc-rest-cap {
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  margin-top: 4px;
}
.sc-divider {
  width: 1.5px;
  align-self: stretch;
  opacity: 0.3;
}
.sc-floor {
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}

.sc-bar-wrap {
  margin-top: 16px;
}
.sc-bar-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 6px;
  gap: 8px;
}
.sc-bar-title {
  font-size: calc(13px * var(--pt-text-scale));
  font-weight: 600;
}
.sc-bar-sub {
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
.sc-bar-track {
  height: 11px;
  border-radius: 7px;
  background: var(--pt-card);
  border: 1.5px solid;
  overflow: hidden;
}
.sc-bar-fill {
  height: 100%;
}

.sc-counts {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 9px;
  margin-top: 16px;
}
.sc-count {
  border-radius: 12px;
  padding: 11px 8px;
  text-align: center;
  border: 1.5px solid;
}
.sc-count-n {
  font-size: calc(22px * var(--pt-text-scale));
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.sc-count-l {
  font-size: calc(11px * var(--pt-text-scale));
  font-weight: 600;
}
.sc-count--ok {
  background: var(--pt-ok-soft);
  border-color: var(--pt-ok);
  color: var(--pt-ok);
}
.sc-count--danger {
  background: var(--pt-danger-soft);
  border-color: var(--pt-danger);
  color: var(--pt-danger);
}
.sc-count--warn {
  background: var(--pt-warn-soft);
  border-color: var(--pt-warn);
  color: var(--pt-warn-text);
}
.sc-count--info {
  background: var(--pt-info-soft);
  border-color: var(--pt-info);
  color: var(--pt-info);
}

.sc-heat {
  margin-top: 16px;
}
.sc-heat-title {
  margin-bottom: 10px;
}

.sc-media {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 14px;
  padding: 12px 0 0;
  border: none;
  border-top: 1.5px dashed var(--pt-border-faint);
  background: none;
  font-family: inherit;
  cursor: pointer;
}
.sc-media-add {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: calc(13px * var(--pt-text-scale));
  font-weight: 600;
  color: var(--pt-info);
}
.sc-media-l {
  font-size: calc(12px * var(--pt-text-scale));
  font-weight: 600;
  color: var(--pt-ink-muted);
}
.sc-media-v {
  font-size: calc(18px * var(--pt-text-scale));
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
</style>
