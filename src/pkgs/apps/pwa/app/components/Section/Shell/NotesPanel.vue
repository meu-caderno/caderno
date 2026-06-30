<script setup lang="ts">
const emit = defineEmits<{ close: [] }>();
const { roots } = useNotebook();
</script>

<template>
  <aside class="notes-panel">
    <div class="notes-panel__head">
      <span class="pt-eyebrow">Notas</span>
      <button
        type="button"
        class="notes-panel__close"
        aria-label="Fechar painel"
        @click="emit('close')"
      >
        <UIIcon icon="x" :size="16" />
      </button>
    </div>
    <div class="notes-panel__list">
      <NuxtLink
        v-for="note in roots"
        :key="note.id"
        to="/caderno"
        class="notes-panel__item"
      >
        <span class="notes-panel__dot" />
        <span class="notes-panel__title">{{ note.title }}</span>
      </NuxtLink>
      <UIEmptyState
        v-if="!roots.length"
        icon="🧠"
        title="Sem notas"
        subtitle="Abra o Caderno para criar."
      />
    </div>
    <NuxtLink to="/caderno" class="notes-panel__open">
      <UIButton variant="leve" icon="list" label="Abrir Caderno" full />
    </NuxtLink>
  </aside>
</template>

<style scoped>
.notes-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 14px;
  background: var(--pt-paper-2);
  border-left: 2px solid var(--pt-border);
  overflow: hidden;
}
.notes-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.notes-panel__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: var(--pt-radius-sm);
  background: transparent;
  color: var(--pt-ink-muted);
  cursor: pointer;
}
.notes-panel__close:hover {
  background: var(--pt-linen);
}
.notes-panel__list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}
.notes-panel__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 9px;
  border-radius: var(--pt-radius-sm);
  text-decoration: none;
  color: var(--pt-ink-soft);
  font-size: calc(13px * var(--pt-text-scale));
}
.notes-panel__item:hover {
  background: var(--pt-card);
}
.notes-panel__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--pt-border-muted);
}
.notes-panel__title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.notes-panel__open {
  text-decoration: none;
}
</style>
