<script setup lang="ts">
import { NAV_ITEMS } from "~/composables/useNav";

const { railItems, ordered } = useLayout();
const navKeys = NAV_ITEMS.map((item) => item.key);
const items = computed(() =>
  ordered(railItems.value, navKeys)
    .map((key) => NAV_ITEMS.find((item) => item.key === key))
    .filter((item): item is (typeof NAV_ITEMS)[number] => item != null),
);
</script>

<template>
  <aside class="rail">
    <div class="rail__brand">
      <span class="rail__mark">📔</span>
      <span class="pt-hand rail__name">Caderno</span>
    </div>
    <nav class="rail__nav">
      <SectionShellNavItem
        v-for="item in items"
        :key="item.key"
        :to="item.to"
        :icon="item.icon"
        :label="item.label"
        layout="rail"
      />
    </nav>
    <div class="rail__foot">Tudo neste aparelho</div>
  </aside>
</template>

<style scoped>
.rail {
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 100vh;
  padding: 18px 13px;
  border-right: 2px solid var(--pt-ink);
  background: var(--pt-paper-soft, var(--pt-paper));
}
.rail__brand {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 4px 12px 14px;
}
.rail__mark {
  font-size: calc(24px * var(--pt-text-scale));
  line-height: 1;
}
.rail__name {
  font-size: calc(22px * var(--pt-text-scale));
  font-weight: 700;
}
.rail__nav {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.rail__foot {
  margin-top: auto;
  padding: 12px;
  font-size: calc(11px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
</style>
