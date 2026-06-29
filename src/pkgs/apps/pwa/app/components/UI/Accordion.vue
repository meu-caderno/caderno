<script setup lang="ts">
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
} from "reka-ui";

interface Item {
  value: string;
  label: string;
}

const model = defineModel<string | string[]>();
defineProps<{ items: Item[]; multiple?: boolean }>();
</script>

<template>
  <AccordionRoot
    v-model="model"
    :type="multiple ? 'multiple' : 'single'"
    :collapsible="true"
    class="uiacc"
  >
    <AccordionItem
      v-for="it in items"
      :key="it.value"
      :value="it.value"
      class="uiacc__item"
    >
      <AccordionHeader class="uiacc__header">
        <AccordionTrigger class="uiacc__trigger">
          {{ it.label }}
          <UIIcon icon="chevron-down" :size="15" class="uiacc__chev" />
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionContent class="uiacc__content">
        <slot :name="it.value" />
      </AccordionContent>
    </AccordionItem>
  </AccordionRoot>
</template>

<style scoped>
.uiacc__item {
  border-bottom: 1.5px solid var(--pt-border-faint);
}
.uiacc__header {
  margin: 0;
}
.uiacc__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  padding: 14px 2px;
  background: none;
  border: none;
  color: var(--pt-ink);
  cursor: pointer;
}
.uiacc__chev {
  transition: transform 0.15s;
  color: var(--pt-ink-muted);
}
.uiacc__trigger[data-state="open"] .uiacc__chev {
  transform: rotate(180deg);
}
.uiacc__content {
  overflow: hidden;
  padding: 0 2px 14px;
}
</style>
