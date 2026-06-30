<script setup lang="ts">
const { focusMin, breakMin, longMin, hydrate, setDurations } = usePomodoro();

onMounted(hydrate);

const focus = ref(focusMin.value);
const brk = ref(breakMin.value);
const long = ref(longMin.value);

watch([focusMin, breakMin, longMin], ([f, b, l]) => {
  focus.value = f;
  brk.value = b;
  long.value = l;
});

function commit() {
  setDurations(focus.value, brk.value, long.value);
}
</script>

<template>
  <SectionSettingsCard
    title="Foco · Pomodoro"
    subtitle="Durações dos ciclos, em minutos."
  >
    <div class="pomodoro-card__rows">
      <label class="pomodoro-card__row">
        <span>Foco</span>
        <input
          v-model.number="focus"
          class="pomodoro-card__input"
          type="number"
          min="1"
          max="120"
          @change="commit"
        />
      </label>
      <label class="pomodoro-card__row">
        <span>Pausa</span>
        <input
          v-model.number="brk"
          class="pomodoro-card__input"
          type="number"
          min="1"
          max="60"
          @change="commit"
        />
      </label>
      <label class="pomodoro-card__row">
        <span>Pausa longa</span>
        <input
          v-model.number="long"
          class="pomodoro-card__input"
          type="number"
          min="1"
          max="60"
          @change="commit"
        />
      </label>
    </div>
  </SectionSettingsCard>
</template>

<style scoped>
.pomodoro-card__rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.pomodoro-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: calc(14px * var(--pt-text-scale));
  font-weight: 600;
}
.pomodoro-card__input {
  width: 80px;
  font-family: inherit;
  font-size: calc(14px * var(--pt-text-scale));
  padding: 8px 10px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink);
  text-align: center;
}
.pomodoro-card__input:focus {
  outline: none;
  border-color: var(--pt-accent);
}
</style>
