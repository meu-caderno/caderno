<script setup lang="ts">
import { ActivityKind, AttendanceStatus, Goal } from "@meu-caderno/core";
import {
  daysFromToday,
  formatDay,
  TODAY,
  useCaderno,
} from "~/composables/useCaderno";

const { context, stats, roll, mark, pendingActivities, subjects } =
  useCaderno();

const todayLabel = computed(() => formatDay(TODAY));

const goalIcon: Record<Goal, string> = {
  [Goal.UNIVERSITY]: "🎓",
  [Goal.PUBLIC_EXAM]: "📚",
  [Goal.OPEN_COURSE]: "🧩",
  [Goal.FREE_STUDY]: "🌱",
  [Goal.NONE]: "📔",
};

const kindIcon: Record<ActivityKind, string> = {
  [ActivityKind.EXAM]: "📝",
  [ActivityKind.ASSIGNMENT]: "📤",
  [ActivityKind.READING]: "📖",
  [ActivityKind.TASK]: "✅",
  [ActivityKind.CAPTURE]: "📥",
};

const contextMeta = computed(() => {
  const term = context.value.terms?.[0]?.label;
  const n = subjects.value.length;
  return [term, `${n} disciplinas`, "neste aparelho"]
    .filter(Boolean)
    .join(" · ");
});

const periodo = computed(() => {
  const all = stats.value;
  if (!all.length) return null;
  const avg = Math.round(all.reduce((s, x) => s + x.freqPct, 0) / all.length);
  const emRisco = all.filter((x) => x.status.key !== "ok").length;
  return { avg, emRisco, total: all.length };
});

function statusFor(id: string) {
  return stats.value.find((s) => s.subject.id === id)?.status;
}

function subjectName(id?: string) {
  return subjects.value.find((s) => s.id === id)?.name;
}

function dueBadge(due?: string): {
  label: string;
  tone: "perigo" | "atencao" | "neutro";
} {
  if (!due) return { label: "inbox", tone: "neutro" };
  const d = daysFromToday(due);
  if (d < 0) return { label: `${-d}d atrás`, tone: "perigo" };
  if (d === 0) return { label: "hoje", tone: "perigo" };
  if (d === 1) return { label: "amanhã", tone: "atencao" };
  if (d <= 3) return { label: `em ${d}d`, tone: "atencao" };
  return { label: formatDay(due), tone: "neutro" };
}
</script>

<template>
  <div class="home">
    <header class="home__head">
      <UICard radius="18px" pad="18px">
        <div class="ctx">
          <span class="ctx__icon">{{ goalIcon[context.goal] ?? "📔" }}</span>
          <div class="ctx__body">
            <div class="pt-hand ctx__name">{{ context.name }}</div>
            <div class="ctx__meta">{{ contextMeta }}</div>
          </div>
          <UIButton variant="leve" icon="settings" aria-label="Configurações" />
        </div>
        <div v-if="periodo" class="ctx__period">
          <UIProgressRing
            :value="periodo.avg"
            :size="56"
            :stroke="7"
            color="var(--pt-ink)"
            caption="período"
          />
          <div class="ctx__period-txt">
            <div class="ctx__period-line">
              Frequência média do período
              <b>{{ periodo.avg }}%</b>
            </div>
            <div class="ctx__period-sub">
              <template v-if="periodo.emRisco">
                {{ periodo.emRisco }} de {{ periodo.total }} disciplinas pedem atenção
              </template>
              <template v-else>Tudo tranquilo por aqui ✦</template>
            </div>
          </div>
        </div>
      </UICard>
    </header>

    <section class="block">
      <div class="block__head">
        <h2 class="pt-hand block__title">Chamada de hoje</h2>
        <span class="block__date">{{ todayLabel }}</span>
      </div>

      <div v-if="roll.length" class="roll">
        <UICard
          v-for="item in roll"
          :key="item.subject.id"
          :accent="item.subject.color"
          pad="14px 16px"
        >
          <div class="roll__row">
            <div class="roll__info">
              <div class="roll__name">{{ item.subject.name }}</div>
              <div class="roll__time">
                <UIIcon icon="calendar" :size="13" />
                {{ item.block ?? "horário a definir" }}
              </div>
            </div>
            <div v-if="item.marked" class="roll__marked">
              <UIBadge
                v-if="item.marked === AttendanceStatus.PRESENT"
                tone="ok"
                size="md"
                dot
                label="presente"
              />
              <UIBadge
                v-else-if="item.marked === AttendanceStatus.ABSENT"
                tone="perigo"
                size="md"
                dot
                label="falta"
              />
              <UIBadge v-else tone="atencao" size="md" dot label="atraso" />
              <button
                class="roll__undo"
                @click="mark(item.subject.id, AttendanceStatus.PRESENT)"
              >
                <UIIcon icon="rotate-ccw" :size="13" /> refazer
              </button>
            </div>
            <div v-else class="roll__actions">
              <UIButton
                variant="primal"
                icon="check"
                label="Presente"
                @click="mark(item.subject.id, AttendanceStatus.PRESENT)"
              />
              <button
                class="roll__mini roll__mini--late"
                title="Atraso"
                @click="mark(item.subject.id, AttendanceStatus.LATE)"
              >
                atraso
              </button>
              <button
                class="roll__mini roll__mini--absent"
                title="Falta"
                @click="mark(item.subject.id, AttendanceStatus.ABSENT)"
              >
                faltei
              </button>
            </div>
          </div>
        </UICard>
      </div>
      <UIEmptyState
        v-else
        icon="🌤"
        title="Nenhuma aula hoje"
        subtitle="Aproveite para adiantar uma atividade ou descansar."
      />
    </section>

    <section class="block">
      <div class="block__head">
        <h2 class="pt-hand block__title">Disciplinas</h2>
        <UIButton variant="fantasma" icon="plus" label="Nova" />
      </div>
      <div class="subjects">
        <HomeSubjectCard
          v-for="stat in stats"
          :key="stat.subject.id"
          :stat="stat"
        />
      </div>
    </section>

    <section class="block">
      <div class="block__head">
        <h2 class="pt-hand block__title">Atividades</h2>
        <span class="block__count">{{ pendingActivities.length }} pendentes</span>
      </div>
      <div class="acts">
        <UICard
          v-for="act in pendingActivities"
          :key="act.id"
          pad="12px 14px"
          flat
          class="act"
        >
          <span class="act__kind">{{ kindIcon[act.kind] ?? "•" }}</span>
          <div class="act__body">
            <div class="act__title">{{ act.title }}</div>
            <div class="act__sub">
              <span
                v-if="act.subjectId"
                class="act__dot"
                :style="{ background: statusFor(act.subjectId)?.color ?? '#c4beb0' }"
              />
              <span v-if="act.subjectId" class="act__subj">{{ subjectName(act.subjectId) }}</span>
              <span v-if="act.subtasks?.length" class="act__subtasks">
                {{ act.subtasks.filter((t) => t.done).length }}/{{ act.subtasks.length }} subtarefas
              </span>
            </div>
          </div>
          <UIBadge
            :tone="dueBadge(act.dueDate).tone"
            size="md"
            :label="dueBadge(act.dueDate).label"
          />
        </UICard>
      </div>
      <UIButton
        variant="fantasma"
        full
        icon="plus"
        label="Capturar atividade"
        class="acts__add"
      />
    </section>
  </div>
</template>

<style scoped>
.home {
  max-width: 720px;
  margin: 0 auto;
  padding: 22px 16px 64px;
  display: flex;
  flex-direction: column;
  gap: 26px;
  container-type: inline-size;
}

.ctx {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.ctx__icon {
  font-size: 30px;
  line-height: 1;
  flex-shrink: 0;
}
.ctx__body {
  flex: 1;
  min-width: 0;
}
.ctx__name {
  font-size: 27px;
  font-weight: 700;
  line-height: 1.05;
}
.ctx__meta {
  font-size: 12px;
  color: var(--pt-ink-muted);
  margin-top: 3px;
}
.ctx__period {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-top: 16px;
  padding-top: 15px;
  border-top: 1.5px dashed var(--pt-border-faint);
}
.ctx__period-line {
  font-size: 14px;
  font-weight: 600;
}
.ctx__period-line b {
  font-variant-numeric: tabular-nums;
}
.ctx__period-sub {
  font-size: 12px;
  color: var(--pt-ink-muted);
  margin-top: 2px;
}

.block {
  display: flex;
  flex-direction: column;
  gap: 13px;
}
.block__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.block__title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
}
.block__date,
.block__count {
  font-size: 13px;
  color: var(--pt-ink-muted);
  font-weight: 600;
}

.roll {
  display: flex;
  flex-direction: column;
  gap: 11px;
}
.roll__row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.roll__info {
  flex: 1;
  min-width: 0;
}
.roll__name {
  font-size: 16px;
  font-weight: 600;
}
.roll__time {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--pt-ink-muted);
  margin-top: 2px;
}
.roll__actions {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-shrink: 0;
}
.roll__mini {
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  padding: 8px 11px;
  border-radius: var(--pt-radius-sm);
  cursor: pointer;
  background: var(--pt-card);
  border: 1.5px solid var(--pt-border-muted);
  color: var(--pt-ink-soft);
}
.roll__mini--late:hover {
  border-color: var(--pt-warn);
  color: var(--pt-warn-text);
}
.roll__mini--absent:hover {
  border-color: var(--pt-danger);
  color: var(--pt-danger);
}
.roll__marked {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.roll__undo {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  color: var(--pt-info);
  cursor: pointer;
}

.subjects {
  display: grid;
  grid-template-columns: 1fr;
  gap: 13px;
}
@container (min-width: 640px) {
  .subjects {
    grid-template-columns: repeat(2, 1fr);
  }
}

.acts {
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.act {
  display: flex;
  align-items: center;
  gap: 12px;
}
.act__kind {
  font-size: 18px;
  line-height: 1;
  flex-shrink: 0;
}
.act__body {
  flex: 1;
  min-width: 0;
}
.act__title {
  font-size: 14px;
  font-weight: 600;
}
.act__sub {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 2px;
  font-size: 12px;
  color: var(--pt-ink-muted);
}
.act__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.act__subtasks::before {
  content: "·";
  margin-right: 7px;
}
.acts__add {
  margin-top: 4px;
}
</style>
