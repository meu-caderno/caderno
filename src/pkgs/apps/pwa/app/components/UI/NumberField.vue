<script setup lang="ts">
import {
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldRoot,
} from "reka-ui";

const model = defineModel<number>();
defineProps<{ min?: number; max?: number; step?: number }>();
</script>

<template>
  <NumberFieldRoot
    v-model="model"
    :min="min"
    :max="max"
    :step="step ?? 1"
    class="uinf"
  >
    <NumberFieldDecrement class="uinf__btn" aria-label="Diminuir">
      <UIIcon icon="minus" :size="14" />
    </NumberFieldDecrement>
    <NumberFieldInput class="uinf__input" />
    <NumberFieldIncrement class="uinf__btn" aria-label="Aumentar">
      <UIIcon icon="plus" :size="14" />
    </NumberFieldIncrement>
  </NumberFieldRoot>
</template>

<style scoped>
.uinf {
  display: inline-flex;
  align-items: center;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  overflow: hidden;
}
.uinf__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 38px;
  border: none;
  background: none;
  color: var(--pt-ink-soft);
  cursor: pointer;
}
.uinf__btn:hover {
  background: var(--pt-paper);
}
.uinf__input {
  width: 56px;
  text-align: center;
  font-family: inherit;
  font-size: calc(15px * var(--pt-text-scale));
  border: none;
  background: none;
  color: var(--pt-ink);
  -moz-appearance: textfield;
}
.uinf__input:focus {
  outline: none;
}
</style>
