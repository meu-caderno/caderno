<script setup lang="ts">
withDefaults(
  defineProps<{
    icon?: string;
    title?: string;
    subtitle?: string;
    actionLabel?: string;
  }>(),
  { icon: "📋", title: "Nada por aqui ainda", subtitle: "" },
);

defineEmits<(e: "action", ev: MouseEvent) => void>();
</script>

<template>
  <div class="pt-empty">
    <div class="pt-empty__glyph">{{ icon }}</div>
    <div class="pt-hand pt-empty__title">{{ title }}</div>
    <div v-if="subtitle" class="pt-empty__sub">{{ subtitle }}</div>
    <button
      v-if="actionLabel"
      type="button"
      class="pt-empty__action"
      @click="$emit('action', $event)"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>

<style scoped>
.pt-empty {
  background: var(--pt-card);
  border: var(--pt-stroke) solid var(--pt-border);
  border-radius: var(--pt-radius-lg);
  padding: 28px 20px;
  text-align: center;
  box-shadow: var(--pt-shadow);
}
.pt-empty__glyph {
  font-size: calc(34px * var(--pt-text-scale));
  margin-bottom: 8px;
  line-height: 1;
}
.pt-empty__title {
  font-size: calc(20px * var(--pt-text-scale));
  font-weight: 700;
  margin-bottom: 4px;
  color: var(--pt-ink);
}
.pt-empty__sub {
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink-faint);
  margin-bottom: 14px;
  line-height: 1.45;
}
.pt-empty__action {
  display: inline-block;
  white-space: nowrap;
  background: var(--pt-ink);
  color: var(--pt-on-ink);
  border: none;
  border-radius: 11px;
  padding: 10px 18px;
  font-family: inherit;
  font-size: calc(14px * var(--pt-text-scale));
  font-weight: 600;
  cursor: pointer;
}
</style>
