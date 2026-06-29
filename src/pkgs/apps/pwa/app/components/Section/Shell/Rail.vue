<script setup lang="ts">
const items = useNav();
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
        :key="item.to"
        v-bind="item"
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
  font-size: 24px;
  line-height: 1;
}
.rail__name {
  font-size: 22px;
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
  font-size: 11px;
  color: var(--pt-ink-muted);
}
</style>
