<script setup lang="ts">
const { tabItems, isVisible } = useLayout();
const items = computed(() =>
  useNav().filter((item) => isVisible(tabItems.value, item.key)),
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
