<script setup lang="ts">
import { NAV_ITEMS } from "~/composables/useNav";

const { tabItems, ordered } = useLayout();
const navKeys = NAV_ITEMS.map((item) => item.key);
const items = computed(() =>
  ordered(tabItems.value, navKeys)
    .map((key) => NAV_ITEMS.find((item) => item.key === key))
    .filter((item): item is (typeof NAV_ITEMS)[number] => item != null),
);
</script>

<template>
  <nav class="tabbar">
    <SectionShellNavItem
      v-for="item in items"
      :key="item.key"
      :to="item.to"
      :icon="item.icon"
      :label="item.label"
      layout="tab"
    />
  </nav>
</template>

<style scoped>
.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 25;
  display: flex;
  align-items: stretch;
  padding: 0 6px;
  padding-bottom: env(safe-area-inset-bottom, 0);
  background: var(--pt-paper);
  border-top: 2px solid var(--pt-ink);
}
</style>
