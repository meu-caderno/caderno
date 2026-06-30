<script setup lang="ts">
import type { Edge, EdgeKind, NotebookNode } from "@meu-caderno/core";
import type { Core, EventObject, NodeSingular } from "cytoscape";
import {
  applyEdgeVisibility,
  applyHighlight,
  countEdgeKinds,
  hasPrereqCycle,
  layoutOptions,
  readPalette,
  styleSheet,
  toElements,
} from "~/utils/graph";

interface Lens {
  name: string;
  hidden: EdgeKind[];
}

const props = defineProps<{ nodes: NotebookNode[]; edges: Edge[] }>();

const container = ref<HTMLDivElement | null>(null);
let cy: Core | null = null;
let registered = false;

const search = ref("");
const hidden = ref<EdgeKind[]>([]);
const focusedId = ref<string | null>(null);
const matchCount = ref(0);
const lenses = useState<Lens[]>("caderno:graph:lenses", () => []);

const hasNodes = computed(() => props.nodes.length > 0);
const counts = computed(() => countEdgeKinds(props.edges));
const hasCycle = computed(() => hasPrereqCycle(props.edges));
const focusActive = computed(() => focusedId.value !== null);

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

function syncHighlight() {
  if (!cy) return;
  matchCount.value = applyHighlight(cy, {
    focusedId: focusedId.value,
    search: search.value,
  });
}

function syncVisibility() {
  if (cy) applyEdgeVisibility(cy, new Set(hidden.value));
}

function syncAll() {
  syncVisibility();
  syncHighlight();
}

function bindEvents() {
  cy?.on("tap", "node", (event: EventObject) => {
    focusedId.value = (event.target as NodeSingular).id();
  });
  cy?.on("tap", (event: EventObject) => {
    if (event.target === cy) focusedId.value = null;
  });
}

function render() {
  const root = container.value;
  if (!cy || !root) return;
  const palette = readPalette(root);
  cy.elements().remove();
  cy.add(toElements(props.nodes, props.edges, palette));
  runLayout();
  focusedId.value = null;
  syncAll();
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
  bindEvents();
  syncAll();
}

function toggleKind(kind: EdgeKind) {
  hidden.value = hidden.value.includes(kind)
    ? hidden.value.filter((item) => item !== kind)
    : [...hidden.value, kind];
}

function saveLens() {
  const name = `lente ${lenses.value.length + 1}`;
  lenses.value = [...lenses.value, { name, hidden: [...hidden.value] }];
}

function applyLens(index: number) {
  const lens = lenses.value[index];
  if (lens) hidden.value = [...lens.hidden];
}

watch(focusedId, syncHighlight);

watch(search, () => {
  if (search.value.trim()) focusedId.value = null;
  syncHighlight();
});

watch(hidden, syncVisibility, { deep: true });

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
  <div v-else class="concept-graph">
    <SectionCadernoGraphControls
      v-model:search="search"
      :counts="counts"
      :hidden="hidden"
      :has-cycle="hasCycle"
      :focus-active="focusActive"
      :match-count="matchCount"
      :lenses="lenses"
      @toggle-kind="toggleKind"
      @clear-focus="focusedId = null"
      @save-lens="saveLens"
      @apply-lens="applyLens"
    />
    <div ref="container" class="concept-graph__canvas" />
  </div>
</template>

<style scoped>
.concept-graph {
  width: 100%;
}
.concept-graph__canvas {
  width: 100%;
  height: 420px;
  border: 1.5px solid var(--pt-border-faint);
  border-radius: var(--pt-radius);
  background: var(--pt-card);
  overflow: hidden;
}
</style>
