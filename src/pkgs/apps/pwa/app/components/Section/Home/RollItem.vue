<script setup lang="ts">
import { AttendanceStatus } from "@meu-caderno/core";
import type { TodayClass } from "~/utils/caderno-stats";

defineProps<{ item: TodayClass }>();
const emit = defineEmits<{ mark: [status: AttendanceStatus] }>();
</script>

<template>
  <UICard :accent="item.subject.color" pad="14px 16px">
    <div class="roll-item">
      <div class="roll-item__info">
        <div class="roll-item__name">{{ item.subject.name }}</div>
        <div class="roll-item__time">
          <UIIcon icon="calendar" :size="13" />
          {{ item.block ?? "horário a definir" }}
        </div>
      </div>

      <div v-if="item.marked" class="roll-item__marked">
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
          class="roll-item__undo"
          @click="emit('mark', AttendanceStatus.PRESENT)"
        >
          <UIIcon icon="rotate-ccw" :size="13" /> refazer
        </button>
      </div>

      <div v-else class="roll-item__actions">
        <UIButton
          variant="primal"
          icon="check"
          label="Presente"
          @click="emit('mark', AttendanceStatus.PRESENT)"
        />
        <button
          class="roll-item__mini roll-item__mini--late"
          title="Atraso"
          @click="emit('mark', AttendanceStatus.LATE)"
        >
          atraso
        </button>
        <button
          class="roll-item__mini roll-item__mini--absent"
          title="Falta"
          @click="emit('mark', AttendanceStatus.ABSENT)"
        >
          faltei
        </button>
      </div>
    </div>
  </UICard>
</template>

<style scoped>
.roll-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.roll-item__info {
  flex: 1;
  min-width: 0;
}
.roll-item__name {
  font-size: calc(16px * var(--pt-text-scale));
  font-weight: 600;
}
.roll-item__time {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  margin-top: 2px;
}
.roll-item__actions {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-shrink: 0;
}
.roll-item__mini {
  font-family: inherit;
  font-size: calc(12px * var(--pt-text-scale));
  font-weight: 600;
  padding: 8px 11px;
  border-radius: var(--pt-radius-sm);
  cursor: pointer;
  background: var(--pt-card);
  border: 1.5px solid var(--pt-border-muted);
  color: var(--pt-ink-soft);
}
.roll-item__mini--late:hover {
  border-color: var(--pt-warn);
  color: var(--pt-warn-text);
}
.roll-item__mini--absent:hover {
  border-color: var(--pt-danger);
  color: var(--pt-danger);
}
.roll-item__marked {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.roll-item__undo {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  font-family: inherit;
  font-size: calc(12px * var(--pt-text-scale));
  font-weight: 600;
  color: var(--pt-info);
  cursor: pointer;
}
</style>
