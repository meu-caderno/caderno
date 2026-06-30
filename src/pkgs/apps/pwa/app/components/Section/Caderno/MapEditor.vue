<script setup lang="ts">
import type { Id, MapItem, NotebookNode, StudyMap } from "@meu-caderno/core";
import { MapItemKind } from "@meu-caderno/core";

const props = defineProps<{ contextId?: Id }>();

const { service, store } = useCadernoService();
const { sorted } = useStudyMaps();

const nodes = useLiveQuery(
  ["nodes"],
  () => store.graph.nodes.list(),
  [] as NotebookNode[],
);
const nodesById = computed(
  () => new Map(nodes.value.map((node) => [node.id, node])),
);
const nodeOptions = computed(() => [
  { value: "", label: "— escolha um conceito —" },
  ...nodes.value.map((node) => ({
    value: node.id as string,
    label: node.title,
  })),
]);

const selectedId = ref<string>("");
const selected = computed(
  () => sorted.value.find((map) => map.id === selectedId.value) ?? null,
);

const newName = ref("");
const sectionLabel = ref("");
const refNode = ref<string>("");

async function createMap() {
  const name = newName.value.trim();
  if (!name) return;
  const result = await service.createMap({
    name,
    items: [],
    contextId: props.contextId,
  });
  newName.value = "";
  if (result.ok) selectedId.value = result.value.id;
}

async function rename(map: StudyMap, event: Event) {
  const name = (event.target as HTMLInputElement).value.trim();
  if (!name || name === map.name) return;
  await service.updateMap({ ...map, name });
}

async function removeMap(map: StudyMap) {
  await service.deleteMap(map.id);
  if (selectedId.value === map.id) selectedId.value = "";
}

async function commitItems(map: StudyMap, items: MapItem[]) {
  await service.updateMap({ ...map, items });
}

function addSection(map: StudyMap) {
  const label = sectionLabel.value.trim();
  if (!label) return;
  sectionLabel.value = "";
  commitItems(map, [...map.items, sectionItem(label)]);
}

function addRef(map: StudyMap) {
  if (!refNode.value) return;
  const nodeId = refNode.value as Id;
  refNode.value = "";
  commitItems(map, [...map.items, refItem(nodeId)]);
}

function move(map: StudyMap, index: number, direction: -1 | 1) {
  commitItems(map, moveItem(map.items, index, direction));
}

function removeItem(map: StudyMap, index: number) {
  commitItems(map, removeItemAt(map.items, index));
}
</script>

<template>
  <div class="map-editor">
    <form class="map-editor__create" @submit.prevent="createMap">
      <input
        v-model="newName"
        class="map-editor__input"
        placeholder="Novo mapa de estudo…"
        aria-label="Nome do novo mapa"
      />
      <UIButton type="submit" label="Criar" icon="plus" :disabled="!newName.trim()" />
    </form>

    <UIEmptyState
      v-if="!sorted.length"
      icon="🗺️"
      title="Nenhum mapa ainda"
      subtitle="Crie um roteiro para organizar seus conceitos."
    />

    <ul v-else class="map-editor__list">
      <li v-for="map in sorted" :key="map.id" class="map-editor__row">
        <button
          type="button"
          class="map-editor__pick"
          :class="{ 'map-editor__pick--active': map.id === selectedId }"
          @click="selectedId = map.id === selectedId ? '' : map.id"
        >
          <UIIcon icon="chevron-down" :size="14" />
          <span class="map-editor__name">{{ map.name }}</span>
          <span class="map-editor__count">{{ map.items.length }}</span>
        </button>
        <button
          type="button"
          class="map-editor__del"
          aria-label="Excluir mapa"
          @click="removeMap(map)"
        >
          <UIIcon icon="trash" :size="14" />
        </button>
      </li>
    </ul>

    <section v-if="selected" class="map-editor__detail">
      <UIField label="Nome do mapa">
        <input
          :key="selected.id"
          :value="selected.name"
          class="map-editor__input"
          aria-label="Renomear mapa"
          @change="rename(selected, $event)"
        />
      </UIField>

      <ol v-if="selected.items.length" class="map-editor__items">
        <li
          v-for="(item, index) in selected.items"
          :key="index"
          class="map-editor__item"
          :class="`map-editor__item--${item.kind === MapItemKind.SECTION ? 'section' : 'ref'}`"
        >
          <span class="map-editor__kind">
            {{ MAP_ITEM_KIND_LABEL[item.kind] }}
          </span>
          <span class="map-editor__label">{{ itemLabel(item, nodesById) }}</span>
          <span class="map-editor__ops">
            <button
              type="button"
              aria-label="Mover para cima"
              :disabled="index === 0"
              @click="move(selected, index, -1)"
            >
              ▲
            </button>
            <button
              type="button"
              aria-label="Mover para baixo"
              :disabled="index === selected.items.length - 1"
              @click="move(selected, index, 1)"
            >
              ▼
            </button>
            <button
              type="button"
              aria-label="Remover item"
              @click="removeItem(selected, index)"
            >
              ✕
            </button>
          </span>
        </li>
      </ol>

      <div class="map-editor__add">
        <form class="map-editor__add-row" @submit.prevent="addSection(selected)">
          <input
            v-model="sectionLabel"
            class="map-editor__input"
            placeholder="Título da seção…"
            aria-label="Título da seção"
          />
          <UIButton
            type="submit"
            variant="leve"
            label="Seção"
            icon="plus"
            :disabled="!sectionLabel.trim()"
          />
        </form>
        <form class="map-editor__add-row" @submit.prevent="addRef(selected)">
          <UISelect
            v-model="refNode"
            :options="nodeOptions"
            placeholder="Adicionar conceito…"
          />
          <UIButton
            type="submit"
            variant="leve"
            label="Conceito"
            icon="plus"
            :disabled="!refNode"
          />
        </form>
      </div>
    </section>
  </div>
</template>

<style scoped>
.map-editor {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.map-editor__create,
.map-editor__add-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.map-editor__input {
  flex: 1;
  min-width: 0;
  font-family: inherit;
  font-size: calc(15px * var(--pt-text-scale));
  padding: 10px 12px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink);
}
.map-editor__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  list-style: none;
  margin: 0;
  padding: 0;
}
.map-editor__row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.map-editor__pick {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
  font-family: inherit;
  font-size: calc(14px * var(--pt-text-scale));
  text-align: left;
  padding: 8px 10px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-faint);
  background: var(--pt-card);
  color: var(--pt-ink);
  cursor: pointer;
}
.map-editor__pick--active {
  border-color: var(--pt-border-muted);
  background: var(--pt-paper);
}
.map-editor__name {
  flex: 1;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.map-editor__count {
  flex-shrink: 0;
  font-size: calc(12px * var(--pt-text-scale));
  font-weight: 700;
  color: var(--pt-ink-muted);
}
.map-editor__del {
  flex-shrink: 0;
  border: none;
  background: none;
  padding: 6px;
  color: var(--pt-ink-muted);
  cursor: pointer;
}
.map-editor__detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top: 1.5px solid var(--pt-border-faint);
  padding-top: 12px;
}
.map-editor__items {
  display: flex;
  flex-direction: column;
  gap: 6px;
  list-style: none;
  margin: 0;
  padding: 0;
}
.map-editor__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-faint);
  background: var(--pt-card);
}
.map-editor__item--section {
  background: var(--pt-paper);
}
.map-editor__kind {
  flex-shrink: 0;
  font-size: calc(11px * var(--pt-text-scale));
  font-weight: 700;
  text-transform: uppercase;
  color: var(--pt-ink-muted);
}
.map-editor__label {
  flex: 1;
  min-width: 0;
  font-size: calc(14px * var(--pt-text-scale));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.map-editor__ops {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.map-editor__ops button {
  border: none;
  background: none;
  padding: 4px 6px;
  font-size: 13px;
  color: var(--pt-ink-soft);
  cursor: pointer;
}
.map-editor__ops button:disabled {
  opacity: 0.3;
  cursor: default;
}
.map-editor__add {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
