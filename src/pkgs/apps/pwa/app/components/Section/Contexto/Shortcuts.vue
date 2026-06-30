<script setup lang="ts">
import type { Id } from "@meu-caderno/core";

const props = defineProps<{ contextId: Id }>();

const shortcuts = computed(() =>
  [
    {
      key: "disciplinas",
      icon: "📚",
      label: "Disciplinas",
      path: "/disciplinas",
    },
    { key: "atividades", icon: "✓", label: "Atividades", path: "/atividades" },
    { key: "agenda", icon: "🗓", label: "Agenda", path: "/agenda" },
  ].map((shortcut) => ({
    ...shortcut,
    to: { path: shortcut.path, query: { contexto: props.contextId } },
  })),
);
</script>

<template>
  <nav class="ctx-shortcuts" aria-label="Atalhos">
    <NuxtLink
      v-for="shortcut in shortcuts"
      :key="shortcut.key"
      :to="shortcut.to"
      class="ctx-shortcuts__tile"
    >
      <span class="ctx-shortcuts__icon">{{ shortcut.icon }}</span>
      {{ shortcut.label }}
    </NuxtLink>
  </nav>
</template>

<style scoped>
.ctx-shortcuts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.ctx-shortcuts__tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 10px;
  border-radius: var(--pt-radius);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  box-shadow: var(--pt-shadow);
  color: var(--pt-ink);
  text-decoration: none;
  font-size: calc(13px * var(--pt-text-scale));
  font-weight: 600;
}
.ctx-shortcuts__icon {
  font-size: calc(22px * var(--pt-text-scale));
  line-height: 1;
}
</style>
