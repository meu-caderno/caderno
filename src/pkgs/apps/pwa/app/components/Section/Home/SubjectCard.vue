<script setup lang="ts">
import type { SubjectStats } from "~/composables/useCaderno";

const props = defineProps<{ stat: SubjectStats }>();
const emit = defineEmits<{ notas: []; detail: [] }>();

const s = computed(() => props.stat);
const subject = computed(() => s.value.subject);

const credits = computed(() => subject.value.credits);
const scheduleLabel = computed(() => {
  const wd = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
  const days = (subject.value.schedule?.weekdays ?? [])
    .map((d) => wd[d])
    .join(" · ");
  return days;
});

const headline = computed(() => {
  const r = s.value.restantes;
  if (r <= 0) return "no limite de faltas";
  return `pode faltar ${r} ${r === 1 ? "aula" : "aulas"}`;
});

const budgetLabel = computed(
  () => `${s.value.faltasUsadas} de ${s.value.maxFaltas} faltas`,
);
const budgetPct = computed(() => {
  if (s.value.maxFaltas <= 0) return "100%";
  const used = Math.min(100, (s.value.faltasUsadas / s.value.maxFaltas) * 100);
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
            :color="s.status.color"
            :bg="s.status.soft"
            :label="s.status.label"
          />
        </div>
        <div class="sc-meta">
          <template v-if="credits">{{ credits }} créditos · {{ s.totalHours }}h</template>
          <template v-if="scheduleLabel"> · {{ scheduleLabel }}</template>
        </div>
      </div>
    </div>

    <div class="sc-budget">
      <div class="sc-budget-num">
        <div class="sc-rest" :style="{ color: s.status.color }">
          {{ s.restantes > 0 ? s.restantes : 0 }}
        </div>
        <div class="sc-rest-cap">aulas que ainda<br >pode faltar</div>
      </div>
      <div class="sc-divider" :style="{ background: s.status.color }" />
      <UIProgressRing
        :value="s.freqPct"
        :color="s.status.color"
        :size="72"
        :stroke="8"
      />
      <div class="sc-floor">
        frequência atual<br >(piso {{ Math.round(s.floor * 100) }}%)
      </div>
    </div>

    <div class="sc-bar-wrap">
      <div class="sc-bar-head">
        <span class="sc-bar-title">{{ headline }}</span>
        <span class="sc-bar-sub">{{ budgetLabel }}</span>
      </div>
      <div class="sc-bar-track" :style="{ borderColor: s.status.color }">
        <div
          class="sc-bar-fill"
          :style="{ width: budgetPct, background: s.status.color }"
        />
      </div>
    </div>

    <div class="sc-counts">
      <div class="sc-count sc-count--ok">
        <div class="sc-count-n">{{ s.counts.present }}</div>
        <div class="sc-count-l">presenças</div>
      </div>
      <div class="sc-count sc-count--danger">
        <div class="sc-count-n">{{ s.counts.absent }}</div>
        <div class="sc-count-l">faltas</div>
      </div>
      <div class="sc-count sc-count--warn">
        <div class="sc-count-n">{{ s.counts.late }}</div>
        <div class="sc-count-l">atrasos</div>
      </div>
      <div class="sc-count sc-count--info">
        <div class="sc-count-n">{{ s.counts.medical }}</div>
        <div class="sc-count-l">atestados</div>
      </div>
    </div>

    <div class="sc-heat">
      <div class="pt-eyebrow sc-heat-title">Ritmo de presença</div>
      <UIHeatmap :cells="s.heat" :cell-size="14" :gap="4" />
    </div>

    <button class="sc-media" type="button" @click="emit('notas')">
      <template v-if="s.media != null">
        <span class="sc-media-l">média parcial</span>
        <span class="sc-media-v">{{ s.media.toFixed(1) }}</span>
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
  font-size: 17px;
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
  font-size: 12px;
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
  font-size: 34px;
  font-weight: 800;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.sc-rest-cap {
  font-size: 12px;
  color: var(--pt-ink-muted);
  margin-top: 4px;
}
.sc-divider {
  width: 1.5px;
  align-self: stretch;
  opacity: 0.3;
}
.sc-floor {
  font-size: 12px;
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
  font-size: 13px;
  font-weight: 600;
}
.sc-bar-sub {
  font-size: 12px;
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
  font-size: 22px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.sc-count-l {
  font-size: 11px;
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
  font-size: 13px;
  font-weight: 600;
  color: var(--pt-info);
}
.sc-media-l {
  font-size: 12px;
  font-weight: 600;
  color: var(--pt-ink-muted);
}
.sc-media-v {
  font-size: 18px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
</style>
