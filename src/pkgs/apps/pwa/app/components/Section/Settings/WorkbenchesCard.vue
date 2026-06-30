<script setup lang="ts">
import type { Workbench } from "@meu-caderno/core";
import { NAV_ITEMS } from "~/composables/useNav";

const { benches, save, remove, invoke } = useWorkbenches();

const name = ref("");

function routeLabel(route: string) {
  return NAV_ITEMS.find((item) => item.to === route)?.label ?? route;
}

async function onSave() {
  await save(name.value);
  name.value = "";
}

function onInvoke(bench: Workbench) {
  invoke(bench);
}
</script>

<template>
  <SectionSettingsCard
    title="Bancadas"
    subtitle="Marque uma mesa de trabalho (tela + contexto) para voltar depois."
  >
    <div v-if="benches.length" class="benches-card__list">
      <div v-for="bench in benches" :key="bench.id" class="benches-card__row">
        <button
          type="button"
          class="benches-card__open"
          @click="onInvoke(bench)"
        >
          <span class="benches-card__name">{{ bench.name }}</span>
          <span class="benches-card__route">{{ routeLabel(bench.route) }}</span>
        </button>
        <button
          type="button"
          class="benches-card__x"
          aria-label="Remover bancada"
          @click="remove(bench.id)"
        >
          <UIIcon icon="trash" :size="14" />
        </button>
      </div>
    </div>

    <div class="benches-card__add">
      <input
        v-model="name"
        class="benches-card__input"
        type="text"
        placeholder="Nome da mesa atual"
        @keyup.enter="onSave"
      />
      <UIButton
        variant="fantasma"
        icon="plus"
        label="Salvar"
        @click="onSave"
      />
    </div>
  </SectionSettingsCard>
</template>

<style scoped>
.benches-card__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.benches-card__row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.benches-card__open {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-family: inherit;
  text-align: left;
  padding: 10px 12px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink);
  cursor: pointer;
}
.benches-card__name {
  font-size: calc(14px * var(--pt-text-scale));
  font-weight: 600;
}
.benches-card__route {
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
.benches-card__x {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--pt-radius-sm);
  border: none;
  background: var(--pt-paper-2);
  color: var(--pt-ink-muted);
  cursor: pointer;
}
.benches-card__add {
  display: flex;
  gap: 8px;
}
.benches-card__input {
  flex: 1;
  font-family: inherit;
  font-size: calc(14px * var(--pt-text-scale));
  padding: 10px 12px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink);
}
.benches-card__input:focus {
  outline: none;
  border-color: var(--pt-accent);
}
</style>
