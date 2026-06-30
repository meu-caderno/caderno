<script setup lang="ts">
const { phaseLabel, timeLabel, running, start, pause, hydrate } = usePomodoro();
const { open } = useFocus();

onMounted(hydrate);
</script>

<template>
  <section class="block pomo-widget">
    <div class="block__head">
      <h2 class="pt-hand block__title">Pausa</h2>
      <span class="block__count">{{ phaseLabel }}</span>
    </div>
    <div class="pomo-widget__row">
      <span class="pomo-widget__time">{{ timeLabel }}</span>
      <div class="pomo-widget__actions">
        <UIButton
          v-if="!running"
          variant="leve"
          icon="check"
          label="Focar"
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
          icon="chevron-right"
          label="Tela cheia"
          @click="open"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.pomo-widget__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.pomo-widget__time {
  font-size: calc(34px * var(--pt-text-scale));
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.pomo-widget__actions {
  display: flex;
  gap: 8px;
}
</style>
