<script setup lang="ts">
const emit = defineEmits<{ action: [value: string] }>();

const items = [
  { value: "capture", label: "Captura rápida", icon: "pencil" as const },
  { value: "inbox", label: "Inbox", icon: "list" as const },
  {
    value: "activity",
    label: "Nova atividade",
    icon: "plus" as const,
    separatorBefore: true,
  },
  { value: "subject", label: "Nova disciplina", icon: "plus" as const },
  { value: "context", label: "Novo contexto", icon: "plus" as const },
];
</script>

<template>
  <UIMenu :items="items" align="end" @select="emit('action', $event)">
    <template #trigger>
      <button type="button" class="quick-menu" aria-label="Criar">
        <UIIcon icon="plus" :size="24" />
      </button>
    </template>
  </UIMenu>
</template>

<style scoped>
.quick-menu {
  position: fixed;
  bottom: 84px;
  right: 18px;
  z-index: 30;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid var(--pt-ink);
  background: var(--pt-ink);
  color: var(--pt-paper);
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(44, 42, 39, 0.3);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
@media (min-width: 960px) {
  .quick-menu {
    bottom: 24px;
    right: 24px;
  }
}
</style>
