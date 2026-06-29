<script setup lang="ts">
import type { LibraryItem } from "@meu-caderno/core";

const { items } = useLibrary();
const { service } = useCadernoService();
const { toast } = useToast();

const creating = ref(false);
const editingItem = ref<LibraryItem | null>(null);
const deletingItem = ref<LibraryItem | null>(null);

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
    <header class="acervo__head">
      <div>
        <h1 class="pt-hand acervo__title">Acervo</h1>
        <p class="acervo__sub">{{ items.length }} itens</p>
      </div>
      <UIButton
        variant="fantasma"
        icon="plus"
        label="Novo"
        @click="creating = true"
      />
    </header>

    <UIEmptyState
      v-if="!items.length"
      icon="📚"
      title="Acervo vazio"
      subtitle="Livros, artigos e vídeos com progresso, nota e resenha."
      action-label="Adicionar item"
      @action="creating = true"
    />
    <div v-else class="acervo__grid">
      <SectionAcervoItemCard
        v-for="item in items"
        :key="item.id"
        :item="item"
        @edit="editingItem = item"
      />
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
  padding: 22px 16px 64px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  container-type: inline-size;
}
.acervo__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.acervo__title {
  font-size: 26px;
  font-weight: 800;
  margin: 0;
}
.acervo__sub {
  font-size: 13px;
  color: var(--pt-ink-muted);
  margin: 4px 0 0;
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
