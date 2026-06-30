<script setup lang="ts">
import type { EdgeKind } from "@meu-caderno/core";
import type { EdgeKindCounts } from "~/utils/graph";
import {
  EDGE_KIND_LABEL,
  EDGE_KIND_ORDER,
  edgeLegend,
  NODE_LEGEND,
} from "~/utils/graph";

interface Lens {
  name: string;
  hidden: EdgeKind[];
}

const props = defineProps<{
  search: string;
  counts: EdgeKindCounts;
  hidden: EdgeKind[];
  hasCycle: boolean;
  focusActive: boolean;
  matchCount: number;
  lenses: Lens[];
}>();

const emit = defineEmits<{
  (event: "update:search", value: string): void;
  (event: "toggle-kind", kind: EdgeKind): void;
  (event: "clear-focus"): void;
  (event: "save-lens"): void;
  (event: "apply-lens", index: number): void;
}>();

const edgeItems = edgeLegend();
const hiddenSet = computed(() => new Set(props.hidden));

function isVisible(kind: EdgeKind): boolean {
  return !hiddenSet.value.has(kind);
}

function onSearch(event: Event): void {
  emit("update:search", (event.target as HTMLInputElement).value);
}

const searching = computed(() => props.search.trim().length > 0);
</script>

<template>
  <div class="graph-controls">
    <div class="graph-controls__row">
      <div class="graph-controls__search">
        <UIIcon icon="search" :size="15" />
        <input
          :value="search"
          class="graph-controls__input"
          type="search"
          placeholder="Buscar conceito…"
          aria-label="Buscar no grafo"
          @input="onSearch"
        />
        <span v-if="searching" class="graph-controls__hits">
          {{ matchCount }}
        </span>
      </div>
      <UIButton
        v-if="focusActive"
        variant="leve"
        label="Limpar foco"
        icon="x"
        @click="emit('clear-focus')"
      />
    </div>

    <div class="graph-controls__row">
      <UIChip
        v-for="kind in EDGE_KIND_ORDER"
        :key="kind"
        :selected="isVisible(kind)"
        :icon="isVisible(kind) ? '👁' : '🙈'"
        @click="emit('toggle-kind', kind)"
      >
        {{ EDGE_KIND_LABEL[kind] }}
        <span class="graph-controls__count">{{ counts[kind] }}</span>
      </UIChip>
    </div>

    <UIBadge
      v-if="hasCycle"
      tone="atencao"
      label="⚠️ há ciclo de pré-requisitos"
    />

    <div class="graph-controls__legend">
      <div class="graph-controls__legend-group">
        <span class="graph-controls__legend-title">nós</span>
        <span
          v-for="item in NODE_LEGEND"
          :key="item.label"
          class="graph-controls__legend-item"
        >
          <span
            class="graph-controls__dot"
            :style="{ background: item.color }"
          />
          {{ item.label }}
        </span>
      </div>
      <div class="graph-controls__legend-group">
        <span class="graph-controls__legend-title">ligações</span>
        <span
          v-for="item in edgeItems"
          :key="item.kind"
          class="graph-controls__legend-item"
        >
          <span
            class="graph-controls__line"
            :style="{
              borderTopColor: item.color,
              borderTopStyle: item.line,
            }"
          />
          {{ item.label }}
        </span>
      </div>
    </div>

    <div class="graph-controls__lenses">
      <button
        type="button"
        class="graph-controls__lens-save"
        @click="emit('save-lens')"
      >
        + salvar lente
      </button>
      <button
        v-for="(lens, index) in lenses"
        :key="index"
        type="button"
        class="graph-controls__lens"
        @click="emit('apply-lens', index)"
      >
        {{ lens.name }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.graph-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
}
.graph-controls__row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.graph-controls__search {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 180px;
  padding: 9px 12px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink-muted);
}
.graph-controls__input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: calc(15px * var(--pt-text-scale));
  color: var(--pt-ink);
}
.graph-controls__hits {
  flex-shrink: 0;
  font-size: calc(12px * var(--pt-text-scale));
  font-weight: 700;
  color: var(--pt-ink-muted);
}
.graph-controls__count {
  font-size: calc(11px * var(--pt-text-scale));
  font-weight: 700;
  opacity: 0.7;
}
.graph-controls__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 10px 12px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-faint);
  background: var(--pt-paper);
}
.graph-controls__legend-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
.graph-controls__legend-title {
  font-size: calc(11px * var(--pt-text-scale));
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--pt-ink-muted);
}
.graph-controls__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink);
}
.graph-controls__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.graph-controls__line {
  width: 18px;
  border-top-width: 2px;
  flex-shrink: 0;
}
.graph-controls__lenses {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.graph-controls__lens,
.graph-controls__lens-save {
  font-family: inherit;
  font-size: calc(12px * var(--pt-text-scale));
  font-weight: 600;
  padding: 5px 11px;
  border-radius: var(--pt-radius-pill);
  cursor: pointer;
  background: var(--pt-card);
  color: var(--pt-ink-muted);
  border: 1.5px dashed var(--pt-border-muted);
}
.graph-controls__lens {
  border-style: solid;
  color: var(--pt-ink);
}
</style>
