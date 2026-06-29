<script setup lang="ts">
import {
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
} from "reka-ui";

const open = defineModel<boolean>("open", { default: false });
defineProps<{ label?: string }>();
</script>

<template>
  <CollapsibleRoot v-model:open="open" class="uicol">
    <CollapsibleTrigger class="uicol__trigger">
      <slot name="trigger">
        <span>{{ label }}</span>
        <UIIcon icon="chevron-down" :size="15" class="uicol__chev" />
      </slot>
    </CollapsibleTrigger>
    <CollapsibleContent class="uicol__content">
      <slot />
    </CollapsibleContent>
  </CollapsibleRoot>
</template>

<style scoped>
.uicol__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  padding: 0;
  background: none;
  border: none;
  color: var(--pt-ink-soft);
  cursor: pointer;
}
.uicol__chev {
  transition: transform 0.15s;
}
.uicol__trigger[data-state="open"] .uicol__chev {
  transform: rotate(180deg);
}
.uicol__content {
  overflow: hidden;
}
</style>
