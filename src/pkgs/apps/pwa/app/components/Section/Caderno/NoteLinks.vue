<script setup lang="ts">
import type { Id, Node } from "@meu-caderno/core";
import { EdgeKind } from "@meu-caderno/core";
import type { NoteLink } from "~/composables/useNotebook";

const props = defineProps<{ node: Node; nodes: Node[]; links: NoteLink[] }>();

const { service } = useCadernoService();

const KIND_LABEL: Record<EdgeKind, string> = {
  [EdgeKind.PART_OF]: "parte de",
  [EdgeKind.PREPARES]: "prepara",
  [EdgeKind.ASSESSES]: "avalia",
  [EdgeKind.SOURCE_OF]: "fonte de",
};
const KIND_OPTIONS = Object.values(EdgeKind).map((value) => ({
  value,
  label: KIND_LABEL[value],
}));

const targetId = ref("");
const kind = ref<string>(EdgeKind.SOURCE_OF);
const adding = ref(false);

const targetOptions = computed(() => [
  { value: "", label: "— escolher nota —" },
  ...props.nodes
    .filter((node) => node.id !== props.node.id)
    .map((node) => ({ value: node.id as string, label: node.title })),
]);

async function addLink() {
  if (!targetId.value || adding.value) return;
  adding.value = true;
  await service.linkNodes(
    props.node.id,
    targetId.value as Id,
    kind.value as EdgeKind,
  );
  adding.value = false;
  targetId.value = "";
}

async function removeLink(id: Id) {
  await service.unlinkNodes(id);
}
</script>

<template>
  <div class="note-links">
    <div class="pt-eyebrow">Conexões</div>
    <div v-if="links.length" class="note-links__list">
      <div v-for="link in links" :key="link.edge.id" class="note-links__row">
        <span class="note-links__kind">
          {{ link.outgoing ? KIND_LABEL[link.edge.kind] : "← " + KIND_LABEL[link.edge.kind] }}
        </span>
        <span class="note-links__name">{{ link.target.title }}</span>
        <button
          type="button"
          class="note-links__x"
          aria-label="Remover conexão"
          @click="removeLink(link.edge.id)"
        >
          <UIIcon icon="x" :size="13" />
        </button>
      </div>
    </div>

    <div class="note-links__add">
      <UISelect v-model="kind" :options="KIND_OPTIONS" />
      <UISelect
        v-model="targetId"
        :options="targetOptions"
        placeholder="— escolher nota —"
      />
      <UIButton
        variant="fantasma"
        icon="plus"
        label="Ligar"
        :disabled="!targetId || adding"
        @click="addLink"
      />
    </div>
  </div>
</template>

<style scoped>
.note-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.note-links__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.note-links__row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
.note-links__kind {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--pt-ink-muted);
  flex-shrink: 0;
}
.note-links__name {
  flex: 1;
  font-weight: 600;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.note-links__x {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: var(--pt-radius-sm);
  border: none;
  background: var(--pt-card);
  color: var(--pt-ink-muted);
  cursor: pointer;
}
.note-links__add {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
