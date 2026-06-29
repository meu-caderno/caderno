<script setup lang="ts">
const emit = defineEmits<{ close: [] }>();

const {
  phaseLabel,
  phase,
  clock,
  ratio,
  running,
  completedFocus,
  start,
  pause,
  reset,
  skip,
  hydrate,
} = usePomodoro();

onMounted(hydrate);
onUnmounted(pause);
</script>

<template>
  <UIModal
    title="Foco"
    subtitle="técnica Pomodoro"
    @close="emit('close')"
  >
    <div class="pomodoro" :class="`pomodoro--${phase}`">
      <span class="pomodoro__phase">{{ phaseLabel }}</span>
      <div class="pomodoro__clock">{{ clock }}</div>
      <div class="pomodoro__track">
        <div
          class="pomodoro__fill"
          :style="{ width: `${Math.round(ratio * 100)}%` }"
        />
      </div>
      <span class="pomodoro__cycles">{{ completedFocus }} foco(s) concluído(s)</span>

      <div class="pomodoro__controls">
        <UIButton
          v-if="!running"
          variant="primal"
          icon="check"
          label="Iniciar"
          @click="start"
        />
        <UIButton
          v-else
          variant="leve"
          icon="minus"
          label="Pausar"
          @click="pause"
        />
        <UIButton
          variant="fantasma"
          icon="rotate-ccw"
          label="Zerar"
          @click="reset"
        />
        <UIButton
          variant="fantasma"
          icon="chevron-right"
          label="Pular"
          @click="skip"
        />
      </div>
    </div>
  </UIModal>
</template>

<style scoped>
.pomodoro {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}
.pomodoro__phase {
  font-size: calc(13px * var(--pt-text-scale));
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--pt-ink-muted);
}
.pomodoro__clock {
  font-size: calc(56px * var(--pt-text-scale));
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.pomodoro__track {
  width: 100%;
  height: 12px;
  border-radius: 7px;
  background: var(--pt-card);
  border: 1.5px solid var(--pt-border-muted);
  overflow: hidden;
}
.pomodoro__fill {
  height: 100%;
  background: var(--pt-accent);
  transition: width 0.4s linear;
}
.pomodoro--break .pomodoro__fill,
.pomodoro--long .pomodoro__fill {
  background: var(--pt-ok);
}
.pomodoro__cycles {
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
.pomodoro__controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
}
</style>
