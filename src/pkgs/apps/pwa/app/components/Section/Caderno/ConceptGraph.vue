<script setup lang="ts">
import type { Edge, NotebookNode } from "@meu-caderno/core";
import type { Core } from "cytoscape";
import {
  layoutOptions,
  readPalette,
  styleSheet,
  toElements,
} from "~/utils/graph";

const props = defineProps<{ nodes: NotebookNode[]; edges: Edge[] }>();

const container = ref<HTMLDivElement | null>(null);
let cy: Core | null = null;
let registered = false;

const hasNodes = computed(() => props.nodes.length > 0);

async function ensureCytoscape() {
  const core = (await import("cytoscape")).default;
  if (!registered) {
    const dagre = (await import("cytoscape-dagre")).default;
    core.use(dagre);
    registered = true;
  }
  return core;
}

function runLayout() {
  cy?.layout(layoutOptions()).run();
}

function render() {
  const root = container.value;
  if (!cy || !root) return;
  const palette = readPalette(root);
  cy.elements().remove();
  cy.add(toElements(props.nodes, props.edges, palette));
  runLayout();
}

async function createGraph() {
  const root = container.value;
  if (!root || cy) return;
  const core = await ensureCytoscape();
  const palette = readPalette(root);
  cy = core({
    container: root,
    elements: toElements(props.nodes, props.edges, palette),
    style: styleSheet(palette),
    layout: layoutOptions(),
    minZoom: 0.3,
    maxZoom: 2.5,
    wheelSensitivity: 0.2,
  });
}

onMounted(() => {
  if (hasNodes.value) createGraph();
});

watch(
  () => [props.nodes, props.edges] as const,
  () => {
    if (!hasNodes.value) return;
    if (cy) render();
    else createGraph();
  },
  { deep: true, flush: "post" },
);

onUnmounted(() => {
  cy?.destroy();
  cy = null;
});
</script>

<template>
  <UIEmptyState
    v-if="!hasNodes"
    icon="🕸️"
    title="Sem grafo ainda"
    subtitle="Adicione conceitos e ligações para visualizar a rede do caderno."
  />
  <div v-else ref="container" class="concept-graph" />
</template>

<style scoped>
.concept-graph {
  width: 100%;
  height: 420px;
  border: 1.5px solid var(--pt-border-faint);
  border-radius: var(--pt-radius);
  background: var(--pt-card);
  overflow: hidden;
}
</style>
