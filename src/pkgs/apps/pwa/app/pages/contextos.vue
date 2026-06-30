<script setup lang="ts">
import type { Id } from "@meu-caderno/core";

const { contexts, effectiveId, setActive } = useActiveContext();

const editingId = ref<Id | null>(null);
const creating = ref(false);

const editingContext = computed(
  () => contexts.value.find((entry) => entry.id === editingId.value) ?? null,
);

const subtitle = computed(() => {
  const total = contexts.value.length;
  return `${total} ${total === 1 ? "contexto" : "contextos"}`;
});

async function openContext(id: Id) {
  await setActive(id);
  editingId.value = id;
}

function activateContext(id: Id) {
  return setActive(id);
}
</script>

<template>
  <SectionHomeOnboarding
    v-if="creating"
    cancelable
    @cancel="creating = false"
    @done="creating = false"
  />
  <div v-else class="contextos">
    <SectionPageHeader title="Contextos" :subtitle="subtitle">
      <template #actions>
        <UIButton
          variant="fantasma"
          icon="plus"
          label="Novo contexto"
          @click="creating = true"
        />
      </template>
    </SectionPageHeader>

    <UIEmptyState
      v-if="!contexts.length"
      icon="📔"
      title="Nenhum contexto ainda"
      subtitle="Uma faculdade, um concurso, um curso — cada um com suas regras."
      action-label="Criar contexto"
      @action="creating = true"
    />
    <div v-else class="contextos__grid">
      <SectionContextosContextCard
        v-for="context in contexts"
        :key="context.id"
        :context="context"
        :active="context.id === effectiveId"
        @open="openContext(context.id)"
        @activate="activateContext(context.id)"
      />
    </div>

    <SectionHomeContextDetail
      v-if="editingContext"
      :context="editingContext"
      @close="editingId = null"
    />
  </div>
</template>

<style scoped>
.contextos {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--pt-pad-screen) 16px 64px;
  display: flex;
  flex-direction: column;
  gap: calc(16px * var(--pt-density));
  container-type: inline-size;
}
.contextos__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 11px;
}
@container (min-width: 640px) {
  .contextos__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
