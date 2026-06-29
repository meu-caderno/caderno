<script setup lang="ts">
import { RadioGroupIndicator, RadioGroupItem, RadioGroupRoot } from "reka-ui";

interface Option {
  value: string;
  label: string;
  desc?: string;
}

const model = defineModel<string>();
defineProps<{ options: Option[] }>();
</script>

<template>
  <RadioGroupRoot v-model="model" class="uirg">
    <label v-for="opt in options" :key="opt.value" class="uirg__item">
      <RadioGroupItem :value="opt.value" class="uirg__radio">
        <RadioGroupIndicator class="uirg__dot" />
      </RadioGroupItem>
      <span class="uirg__text">
        <span class="uirg__label">{{ opt.label }}</span>
        <span v-if="opt.desc" class="uirg__desc">{{ opt.desc }}</span>
      </span>
    </label>
  </RadioGroupRoot>
</template>

<style scoped>
.uirg {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.uirg__item {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 11px 13px;
  border: 1.5px solid var(--pt-border-muted);
  border-radius: var(--pt-radius-sm);
  background: var(--pt-card);
  cursor: pointer;
}
.uirg__item:has([data-state="checked"]) {
  border-color: var(--pt-ink);
  background: var(--pt-paper);
}
.uirg__radio {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-paper);
  margin-top: 1px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.uirg__radio[data-state="checked"] {
  border-color: var(--pt-ink);
}
.uirg__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--pt-ink);
}
.uirg__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.uirg__label {
  font-size: 14px;
  font-weight: 600;
}
.uirg__desc {
  font-size: 12px;
  color: var(--pt-ink-muted);
  line-height: 1.4;
}
</style>
