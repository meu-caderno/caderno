<script setup lang="ts">
import type { Id, Node } from "@meu-caderno/core";

const { nodes, roots, linksOf } = useNotebook();
const { service } = useCadernoService();
const { toast } = useToast();

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
function select(node: Node) {
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
    <header class="caderno__head">
      <div>
        <h1 class="pt-hand caderno__title">Caderno</h1>
        <p class="caderno__sub">{{ nodes.length }} notas em rede</p>
      </div>
      <UIButton variant="fantasma" icon="plus" label="Nova" @click="openCreate" />
    </header>

    <UIEmptyState
      v-if="!nodes.length"
      icon="🧠"
      title="Caderno vazio"
      subtitle="Notas em árvore e conhecimento conectado em rede."
      action-label="Nova nota"
      @action="openCreate"
    />
    <div v-else class="caderno__tree">
      <SectionCadernoNoteRow
        v-for="node in roots"
        :key="node.id"
        :node="node"
        :nodes="nodes"
        @select="select"
      />
    </div>

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
  padding: 22px 16px 64px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.caderno__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.caderno__title {
  font-size: 26px;
  font-weight: 800;
  margin: 0;
}
.caderno__sub {
  font-size: 13px;
  color: var(--pt-ink-muted);
  margin: 4px 0 0;
}
.caderno__tree {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
</style>
