<script setup lang="ts">
import { TabsList, TabsRoot, TabsTrigger } from "reka-ui";

interface Tab {
  value: string;
  label: string;
}

const model = defineModel<string>();
defineProps<{ tabs: Tab[] }>();
</script>

<template>
  <TabsRoot v-model="model" class="uitabs">
    <TabsList class="uitabs__list">
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        class="uitabs__tab"
      >
        {{ tab.label }}
      </TabsTrigger>
    </TabsList>
    <slot />
  </TabsRoot>
</template>

<style scoped>
.uitabs__list {
  display: inline-flex;
  gap: 3px;
  padding: 4px;
  border-radius: var(--pt-radius-md);
  background: var(--pt-card);
  border: 1.5px solid var(--pt-border-muted);
}
.uitabs__tab {
  font-family: inherit;
  font-size: calc(13px * var(--pt-text-scale));
  font-weight: 600;
  padding: 7px 13px;
  border-radius: var(--pt-radius-sm);
  border: none;
  background: none;
  color: var(--pt-ink-muted);
  cursor: pointer;
}
.uitabs__tab[data-state="active"] {
  background: var(--pt-paper);
  color: var(--pt-ink);
  box-shadow: 0 1px 3px rgba(var(--pt-ink-rgb), 0.1);
}
</style>
