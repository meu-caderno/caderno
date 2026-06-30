<script setup lang="ts">
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import type { Id, NotebookNode } from "@meu-caderno/core";
import { reviewQueue } from "@meu-caderno/core";
import { concepts } from "~/utils/concepts";

const { nodes, edges, roots, linksOf } = useNotebook();
const { effectiveId } = useActiveContext();
const { service } = useCadernoService();
const { toast } = useToast();

type CadernoView =
  | "tree"
  | "list"
  | "board"
  | "table"
  | "review"
  | "grafo"
  | "mapas";
const VIEWS: { value: CadernoView; label: string; icon: string }[] = [
  { value: "tree", label: "Árvore", icon: "🌳" },
  { value: "list", label: "Lista", icon: "📋" },
  { value: "board", label: "Board", icon: "🗂️" },
  { value: "table", label: "Tabela", icon: "▦" },
  { value: "review", label: "Revisão", icon: "🔁" },
  { value: "grafo", label: "Grafo", icon: "🕸️" },
  { value: "mapas", label: "Mapas", icon: "🗺️" },
];
const view = ref<CadernoView>("tree");
const conceptNodes = computed(() => concepts(nodes.value));
const reviewNodes = computed(() => reviewQueue(nodes.value));

const treeEl = ref<HTMLElement | null>(null);
const rootOver = ref(false);

async function reparentToRoot(childId: Id) {
  const dragged = nodes.value.find((node) => node.id === childId);
  if (!dragged || dragged.parentId === undefined) return;
  await service.updateNode({ ...dragged, parentId: undefined });
}

let cleanupTree = () => {};
onMounted(() => {
  const element = treeEl.value;
  if (!element) return;
  cleanupTree = dropTargetForElements({
    element,
    getData: () => ({ root: true }),
    onDrag: ({ location }) => {
      rootOver.value = location.current.dropTargets[0]?.data.root === true;
    },
    onDragLeave: () => {
      rootOver.value = false;
    },
    onDrop: ({ source, location }) => {
      rootOver.value = false;
      const innermost = location.current.dropTargets[0];
      if (innermost?.data.root !== true) return;
      const childId = source.data.noteId;
      if (typeof childId === "string") void reparentToRoot(childId as Id);
    },
  });
});
onUnmounted(() => cleanupTree());

const creating = ref(false);
const createParentId = ref<Id | undefined>(undefined);
const selectedId = ref<Id | null>(null);
const editing = ref(false);
const deleting = ref(false);

const selected = computed(
  () => nodes.value.find((node) => node.id === selectedId.value) ?? null,
);
const selectedLinks = computed(() =>
  selected.value ? linksOf(selected.value.id) : [],
);

function openCreate() {
  createParentId.value = undefined;
  creating.value = true;
}
function select(node: NotebookNode) {
  selectedId.value = node.id;
  editing.value = false;
  deleting.value = false;
}

async function confirmDelete() {
  const node = selected.value;
  deleting.value = false;
  selectedId.value = null;
  if (!node) return;
  const res = await service.deleteNode(node.id);
  if (res.ok) toast({ title: `${node.title} excluída` });
}
</script>

<template>
  <div class="caderno">
    <SectionPageHeader title="Caderno" :subtitle="`${nodes.length} notas em rede`">
      <template #actions>
        <UIButton
          variant="fantasma"
          icon="plus"
          label="Nova"
          @click="openCreate"
        />
      </template>
    </SectionPageHeader>

    <UIEmptyState
      v-if="!nodes.length"
      icon="🧠"
      title="Caderno vazio"
      subtitle="Notas em árvore e conhecimento conectado em rede."
      action-label="Nova nota"
      @action="openCreate"
    />
    <template v-else>
      <div class="caderno__views">
        <UIChip
          v-for="option in VIEWS"
          :key="option.value"
          :label="option.label"
          :icon="option.icon"
          :selected="view === option.value"
          @click="view = option.value"
        />
      </div>

      <div
        v-show="view === 'tree'"
        ref="treeEl"
        class="caderno__tree"
        :class="{ 'caderno__tree--over': rootOver }"
      >
        <SectionCadernoNoteRow
          v-for="node in roots"
          :key="node.id"
          :node="node"
          :nodes="nodes"
          @select="select"
        />
      </div>

      <SectionCadernoReviewMode
        v-if="view === 'review'"
        :queue="reviewNodes"
        @select="select"
      />
      <SectionCadernoConceptGraph
        v-else-if="view === 'grafo'"
        :nodes="nodes"
        :edges="edges"
      />
      <SectionCadernoMapEditor
        v-else-if="view === 'mapas'"
        :context-id="effectiveId ?? undefined"
      />
      <UIEmptyState
        v-else-if="view !== 'tree' && !conceptNodes.length"
        icon="💡"
        title="Sem conceitos"
        subtitle="Marque notas com o aspecto Conceito para acompanhar a maestria."
      />
      <SectionCadernoConceptList
        v-else-if="view === 'list'"
        :concepts="conceptNodes"
        @select="select"
      />
      <SectionCadernoConceptBoard
        v-else-if="view === 'board'"
        :concepts="conceptNodes"
        @select="select"
      />
      <SectionCadernoConceptTable
        v-else-if="view === 'table'"
        :concepts="conceptNodes"
        @select="select"
      />
    </template>

    <SectionCadernoNoteForm
      v-if="creating"
      :nodes="nodes"
      :parent-id="createParentId"
      @done="creating = false"
      @cancel="creating = false"
    />
    <SectionCadernoNoteForm
      v-if="selected && editing"
      :node="selected"
      :nodes="nodes"
      @done="editing = false"
      @cancel="editing = false"
      @delete="
        editing = false;
        deleting = true;
      "
    />
    <SectionCadernoNoteDetail
      v-if="selected && !editing && !deleting"
      :node="selected"
      :nodes="nodes"
      :links="selectedLinks"
      @close="selectedId = null"
      @edit="editing = true"
      @delete="deleting = true"
      @select="select"
    />
    <UIConfirm
      v-if="selected && deleting"
      title="Excluir nota?"
      :description="`Remove ${selected.title}. As sub-notas sobem um nível e as conexões são apagadas.`"
      confirm-label="Excluir"
      danger
      @confirm="confirmDelete"
      @cancel="deleting = false"
    />
  </div>
</template>

<style scoped>
.caderno {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--pt-pad-screen) 16px 64px;
  display: flex;
  flex-direction: column;
  gap: calc(16px * var(--pt-density));
  container-type: inline-size;
}
.caderno__views {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.caderno__tree {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px dashed transparent;
}
.caderno__tree--over {
  border-color: var(--pt-accent);
}
</style>
