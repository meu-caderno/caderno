<script setup lang="ts">
const items = useNav();
</script>

<template>
  <nav class="tabbar">
    <SectionShellNavItem
      v-for="item in items"
      :key="item.to"
      v-bind="item"
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
