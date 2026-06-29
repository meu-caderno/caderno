<script setup lang="ts">
import { ToggleGroupItem, ToggleGroupRoot } from "reka-ui";

interface Option {
  value: string;
  label: string;
}

const model = defineModel<string | string[]>();
defineProps<{ options: Option[]; multiple?: boolean }>();
</script>

<template>
  <ToggleGroupRoot
    v-model="model"
    :type="multiple ? 'multiple' : 'single'"
    class="uitg"
  >
    <ToggleGroupItem
      v-for="opt in options"
      :key="opt.value"
      :value="opt.value"
      class="uitg__item"
    >
      {{ opt.label }}
    </ToggleGroupItem>
  </ToggleGroupRoot>
</template>

<style scoped>
.uitg {
  display: inline-flex;
  gap: 5px;
  flex-wrap: wrap;
}
.uitg__item {
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink-soft);
  cursor: pointer;
}
.uitg__item[data-state="on"] {
  border-color: var(--pt-accent);
  background: var(--pt-paper);
  color: var(--pt-ink);
}
</style>
