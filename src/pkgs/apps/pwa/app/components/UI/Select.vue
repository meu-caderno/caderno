<script setup lang="ts">
import {
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from "reka-ui";

interface Option {
  value: string;
  label: string;
}

const model = defineModel<string>();
defineProps<{ options: Option[]; placeholder?: string }>();
</script>

<template>
  <SelectRoot v-model="model">
    <SelectTrigger class="uisel__trigger" aria-label="Selecionar">
      <SelectValue :placeholder="placeholder ?? 'Selecionar…'" />
      <SelectIcon class="uisel__icon">
        <UIIcon icon="chevron-down" :size="15" />
      </SelectIcon>
    </SelectTrigger>
    <SelectPortal>
      <SelectContent class="uisel__content" position="popper" :side-offset="6">
        <SelectViewport class="uisel__vp">
          <SelectItem
            v-for="opt in options"
            :key="opt.value"
            :value="opt.value"
            class="uisel__item"
          >
            <SelectItemText>{{ opt.label }}</SelectItemText>
            <SelectItemIndicator class="uisel__ind">
              <UIIcon icon="check" :size="14" />
            </SelectItemIndicator>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>

<style scoped>
.uisel__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  font-family: inherit;
  font-size: calc(15px * var(--pt-text-scale));
  padding: 10px 12px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink);
  cursor: pointer;
}
.uisel__icon {
  color: var(--pt-ink-muted);
}
.uisel__content {
  z-index: 40;
  min-width: var(--reka-select-trigger-width);
  background: var(--pt-card);
  border: 1.5px solid var(--pt-border-muted);
  border-radius: var(--pt-radius-md);
  box-shadow: 0 12px 28px rgba(44, 42, 39, 0.16);
  overflow: hidden;
}
.uisel__vp {
  padding: 6px;
}
.uisel__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: calc(14px * var(--pt-text-scale));
  font-weight: 600;
  padding: 9px 10px;
  border-radius: var(--pt-radius-sm);
  color: var(--pt-ink-soft);
  cursor: pointer;
  outline: none;
}
.uisel__item[data-highlighted] {
  background: var(--pt-paper);
  color: var(--pt-ink);
}
.uisel__ind {
  color: var(--pt-ink);
}
</style>
