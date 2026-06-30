<script setup lang="ts">
import type { LibraryItem } from "@meu-caderno/core";
import { LibraryKind } from "@meu-caderno/core";

const { items } = useLibrary();
const { service } = useCadernoService();
const { toast } = useToast();

const creating = ref(false);
const editingItem = ref<LibraryItem | null>(null);
const deletingItem = ref<LibraryItem | null>(null);
const kindFilter = ref<LibraryKind | null>(null);

const kindFilters = computed(() =>
  LIBRARY_KIND_OPTIONS.filter((option) =>
    items.value.some((item) => item.kind === option.value),
  ),
);
const groups = computed(() =>
  groupByState(filterByKind(items.value, kindFilter.value)),
);

function setKindFilter(value: LibraryKind | null) {
  kindFilter.value = kindFilter.value === value ? null : value;
}

async function confirmDelete() {
  const item = deletingItem.value;
  deletingItem.value = null;
  editingItem.value = null;
  if (!item) return;
  const res = await service.deleteLibraryItem(item.id);
  if (res.ok) toast({ title: `${item.title} removido` });
}
</script>

<template>
  <div class="acervo">
    <SectionPageHeader title="Acervo" :subtitle="`${items.length} itens`">
      <template #actions>
        <UIButton
          variant="fantasma"
          icon="plus"
          label="Novo"
          @click="creating = true"
        />
      </template>
    </SectionPageHeader>

    <UIEmptyState
      v-if="!items.length"
      icon="📚"
      title="Acervo vazio"
      subtitle="Livros, artigos e vídeos com progresso, nota e resenha."
      action-label="Adicionar item"
      @action="creating = true"
    />
    <div v-if="items.length && kindFilters.length > 1" class="acervo__filters">
      <UIChip
        label="Todos"
        :selected="kindFilter === null"
        @click="setKindFilter(null)"
      />
      <UIChip
        v-for="option in kindFilters"
        :key="option.value"
        :label="option.label"
        :selected="kindFilter === option.value"
        @click="setKindFilter(option.value)"
      />
    </div>

    <div v-if="items.length" class="acervo__board">
      <section
        v-for="group in groups"
        v-show="group.items.length"
        :key="group.state"
        class="acervo__group"
      >
        <header class="acervo__group-head">
          <span class="acervo__group-title">{{ group.label }}</span>
          <span class="acervo__group-count">{{ group.items.length }}</span>
        </header>
        <div class="acervo__grid">
          <SectionAcervoItemCard
            v-for="item in group.items"
            :key="item.id"
            :item="item"
            @edit="editingItem = item"
          />
        </div>
      </section>
    </div>

    <SectionAcervoItemForm
      v-if="creating"
      @done="creating = false"
      @cancel="creating = false"
    />
    <SectionAcervoItemForm
      v-if="editingItem && !deletingItem"
      :item="editingItem"
      @done="editingItem = null"
      @cancel="editingItem = null"
      @delete="deletingItem = editingItem"
    />
    <UIConfirm
      v-if="deletingItem"
      title="Remover item?"
      :description="`Isso remove ${deletingItem.title} do acervo.`"
      confirm-label="Remover"
      danger
      @confirm="confirmDelete"
      @cancel="deletingItem = null"
    />
  </div>
</template>

<style scoped>
.acervo {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--pt-pad-screen) 16px 64px;
  display: flex;
  flex-direction: column;
  gap: calc(16px * var(--pt-density));
  container-type: inline-size;
}
.acervo__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.acervo__board {
  display: flex;
  flex-direction: column;
  gap: calc(20px * var(--pt-density));
}
.acervo__group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.acervo__group-head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.acervo__group-title {
  font-size: calc(12px * var(--pt-text-scale));
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--pt-ink-muted);
}
.acervo__group-count {
  font-size: calc(11px * var(--pt-text-scale));
  font-weight: 700;
  color: var(--pt-ink-muted);
  background: var(--pt-card);
  padding: 1px 7px;
  border-radius: var(--pt-radius-pill);
}
.acervo__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 11px;
}
@container (min-width: 640px) {
  .acervo__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
