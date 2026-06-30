<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>();
</script>

<template>
  <header class="section-page-header">
    <div>
      <h1 class="pt-hand section-page-header__title">{{ title }}</h1>
      <p v-if="subtitle" class="section-page-header__sub">{{ subtitle }}</p>
    </div>
    <slot name="actions" />
  </header>
</template>

<style scoped>
.section-page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.section-page-header__title {
  font-size: calc(26px * var(--pt-text-scale));
  font-weight: 800;
  margin: 0;
}
.section-page-header__sub {
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  margin: 4px 0 0;
}
</style>
