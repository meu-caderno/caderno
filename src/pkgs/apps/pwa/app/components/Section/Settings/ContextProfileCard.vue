<script setup lang="ts">
import type { Context } from "@meu-caderno/core";

const { focusIds, toggleFocus } = useActiveContext();
const { store } = useCadernoService();

const contexts = useLiveQuery<Context[]>(
  ["contexts"],
  () => store.contexts.list(),
  [],
);
const visible = computed(() =>
  contexts.value.filter((context) => !context.archived),
);

function isOn(id: Context["id"]) {
  return focusIds.value.includes(id);
}
</script>

<template>
  <UICard pad="18px" class="ctx-profile">
    <div class="ctx-profile__head">
      <h2 class="pt-hand ctx-profile__title">Perfil de contexto</h2>
      <p class="ctx-profile__sub">
        Escolha quais contextos aparecem na troca rápida. Nenhum marcado mostra
        todos.
      </p>
    </div>

    <div v-if="visible.length" class="ctx-profile__list">
      <button
        v-for="context in visible"
        :key="context.id"
        type="button"
        class="ctx-profile__row"
        @click="toggleFocus(context.id)"
      >
        <span
          class="ctx-profile__check"
          :class="{ 'ctx-profile__check--on': isOn(context.id) }"
        >
          <UIIcon v-if="isOn(context.id)" icon="check" :size="13" />
        </span>
        <span class="ctx-profile__name">{{ context.name }}</span>
      </button>
    </div>
    <p v-else class="ctx-profile__empty">Nenhum contexto ainda.</p>
  </UICard>
</template>

<style scoped>
.ctx-profile {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.ctx-profile__title {
  font-size: calc(19px * var(--pt-text-scale));
  font-weight: 700;
  margin: 0;
}
.ctx-profile__sub {
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  margin: 4px 0 0;
}
.ctx-profile__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ctx-profile__row {
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  text-align: left;
  font-family: inherit;
  padding: 10px 12px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink);
  cursor: pointer;
}
.ctx-profile__check {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-paper);
  color: var(--pt-on-accent);
}
.ctx-profile__check--on {
  background: var(--pt-accent);
  border-color: var(--pt-accent);
}
.ctx-profile__name {
  font-size: calc(14px * var(--pt-text-scale));
  font-weight: 600;
}
.ctx-profile__empty {
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  margin: 0;
}
</style>
