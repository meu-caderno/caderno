<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>();
</script>

<template>
  <UICard pad="18px" class="settings-card">
    <header class="settings-card__head">
      <div class="settings-card__heading">
        <h2 class="pt-hand settings-card__title">{{ title }}</h2>
        <p v-if="subtitle" class="settings-card__sub">{{ subtitle }}</p>
      </div>
      <slot name="actions" />
    </header>
    <slot />
  </UICard>
</template>

<style scoped>
.settings-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.settings-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.settings-card__title {
  font-size: calc(19px * var(--pt-text-scale));
  font-weight: 700;
  margin: 0;
}
.settings-card__sub {
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  margin: 4px 0 0;
}
</style>
