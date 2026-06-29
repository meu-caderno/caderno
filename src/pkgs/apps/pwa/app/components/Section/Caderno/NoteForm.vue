<script setup lang="ts">
import type { Id, Node } from "@meu-caderno/core";
import { Aspect, descendants } from "@meu-caderno/core";

const props = defineProps<{ node?: Node; nodes: Node[]; parentId?: Id }>();
const emit = defineEmits<{ done: []; cancel: []; delete: [] }>();

const { service } = useCadernoService();

const editing = computed(() => props.node != null);

const ASPECT_OPTIONS = [
  { value: Aspect.NOTE, label: "Nota" },
  { value: Aspect.CONCEPT, label: "Conceito" },
  { value: Aspect.TASK, label: "Tarefa" },
  { value: Aspect.WORK, label: "Trabalho" },
];

const title = ref(props.node?.title ?? "");
const body = ref(props.node?.body ?? "");
const aspects = ref<string[]>([...(props.node?.aspects ?? [Aspect.NOTE])]);
const parent = ref<string>(props.node?.parentId ?? props.parentId ?? "");
const saving = ref(false);

const parentOptions = computed(() => {
  const blocked = new Set<string>();
  if (props.node) {
    blocked.add(props.node.id);
    for (const d of descendants(props.nodes, props.node.id)) blocked.add(d.id);
  }
  return [
    { value: "", label: "— sem nota-mãe —" },
    ...props.nodes
      .filter((node) => !blocked.has(node.id))
      .map((node) => ({ value: node.id as string, label: node.title })),
  ];
});

async function save() {
  const trimmed = title.value.trim();
  if (!trimmed || saving.value || !aspects.value.length) return;
  saving.value = true;
  const fields = {
    title: trimmed,
    body: body.value.trim() || undefined,
    aspects: aspects.value as Aspect[],
    parentId: parent.value ? (parent.value as Id) : undefined,
  };
  const res = props.node
    ? await service.updateNode({ ...props.node, ...fields })
    : await service.createNode(fields);
  saving.value = false;
  if (res.ok) emit("done");
}
</script>

<template>
  <UIModal
    :title="editing ? 'Editar nota' : 'Nova nota'"
    subtitle="conceito, tarefa, anotação…"
    @close="emit('cancel')"
  >
    <div class="note-form">
      <UIField label="Título">
        <input
          v-model="title"
          class="note-form__input"
          type="text"
          placeholder="Ex.: Teorema fundamental"
          @keyup.enter="save"
        />
      </UIField>
      <UIField label="Conteúdo">
        <textarea
          v-model="body"
          class="note-form__input note-form__textarea"
          rows="4"
          placeholder="Anote aqui…"
        />
      </UIField>
      <UIField label="Aspectos">
        <UIToggleGroup v-model="aspects" :options="ASPECT_OPTIONS" multiple />
      </UIField>
      <UIField label="Nota-mãe">
        <UISelect v-model="parent" :options="parentOptions" />
      </UIField>

      <div class="note-form__actions">
        <UIButton
          v-if="editing"
          variant="fantasma"
          icon="trash"
          label="Excluir"
          @click="emit('delete')"
        />
        <div class="note-form__spacer" />
        <UIButton variant="fantasma" label="Cancelar" @click="emit('cancel')" />
        <UIButton
          variant="primal"
          icon="check"
          :label="saving ? 'Salvando…' : editing ? 'Salvar' : 'Criar nota'"
          @click="save"
        />
      </div>
    </div>
  </UIModal>
</template>

<style scoped>
.note-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.note-form__input {
  font-family: inherit;
  font-size: calc(15px * var(--pt-text-scale));
  padding: 10px 12px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink);
  width: 100%;
}
.note-form__input:focus {
  outline: none;
  border-color: var(--pt-ink);
}
.note-form__textarea {
  resize: vertical;
}
.note-form__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}
.note-form__spacer {
  flex: 1;
}
</style>
