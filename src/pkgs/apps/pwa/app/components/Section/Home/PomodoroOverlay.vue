<script setup lang="ts">
const emit = defineEmits<{ close: [] }>();

const {
  phaseLabel,
  phase,
  timeLabel,
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
  <div class="pomodoro" :class="`pomodoro--${phase}`" role="dialog" aria-label="Foco — Pomodoro">
    <button class="pomodoro__close" type="button" aria-label="Sair do foco" @click="emit('close')">
      <UIIcon icon="x" :size="20" />
    </button>
    <span class="pomodoro__phase">{{ phaseLabel }}</span>
    <div class="pomodoro__clock">{{ timeLabel }}</div>
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
</template>

<style scoped>
.pomodoro {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 32px 20px calc(32px + env(safe-area-inset-bottom));
  background: #1b1916;
  color: #f4f1ea;
}
.pomodoro__close {
  position: absolute;
  top: calc(16px + env(safe-area-inset-top));
  right: 18px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #4a463f;
  border-radius: var(--pt-radius-sm);
  background: #262320;
  color: #f4f1ea;
  cursor: pointer;
}
.pomodoro__close:hover {
  background: #322e29;
}
.pomodoro__phase {
  font-size: calc(13px * var(--pt-text-scale));
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #a39d8f;
}
.pomodoro__clock {
  font-size: calc(96px * var(--pt-text-scale));
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.pomodoro__track {
  width: min(420px, 100%);
  height: 12px;
  border-radius: 7px;
  background: #262320;
  border: 1.5px solid #4a463f;
  overflow: hidden;
}
.pomodoro__fill {
  height: 100%;
  background: #e8c37e;
  transition: width 0.4s linear;
}
.pomodoro--break .pomodoro__fill,
.pomodoro--long .pomodoro__fill {
  background: #9ad6a6;
}
.pomodoro__cycles {
  font-size: calc(12px * var(--pt-text-scale));
  color: #a39d8f;
}
.pomodoro__controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
}
</style>
