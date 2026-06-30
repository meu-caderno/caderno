<script setup lang="ts">
import type { Node } from "@meu-caderno/core";
import {
  ActivityKind,
  ActivityStatus,
  Aspect,
  children,
  Root,
} from "@meu-caderno/core";
import type { NoteLink } from "~/composables/useNotebook";

const props = defineProps<{ node: Node; nodes: Node[]; links: NoteLink[] }>();
const emit = defineEmits<{
  close: [];
  edit: [];
  delete: [];
  select: [node: Node];
}>();

const { service, ids } = useCadernoService();
const { toast } = useToast();

const ASPECT_LABEL: Record<Aspect, string> = {
  [Aspect.NOTE]: "Nota",
  [Aspect.CONCEPT]: "Conceito",
  [Aspect.TASK]: "Tarefa",
  [Aspect.WORK]: "Trabalho",
};

const kids = computed(() => children(props.nodes, props.node.id));

async function promoteToActivity() {
  const result = await service.upsertActivity({
    id: await ids.newId(),
    title: props.node.title,
    kind: ActivityKind.TASK,
    status: ActivityStatus.OPEN,
    root: Root.CONTEXT,
    subjectId: props.node.subjectId,
    contextId: props.node.contextId,
  });
  if (result.ok) {
    toast({ title: `“${props.node.title}” virou atividade` });
    emit("close");
  }
}
</script>

<template>
  <UIModal :title="node.title" @close="emit('close')">
    <div class="note-detail">
      <div class="note-detail__aspects">
        <UIChip
          v-for="aspect in node.aspects"
          :key="aspect"
          :label="ASPECT_LABEL[aspect]"
        />
      </div>

      <!-- biome-ignore lint/security/noDangerouslySetInnerHtml: conteúdo local do próprio usuário, gerado pelo editor TipTap (sem fonte externa). -->
      <div
        v-if="node.body"
        class="note-detail__body tiptap-content"
        v-html="node.body"
      />
      <p v-else class="note-detail__empty">Sem conteúdo.</p>

      <div v-if="kids.length" class="note-detail__children">
        <div class="pt-eyebrow">Sub-notas</div>
        <button
          v-for="kid in kids"
          :key="kid.id"
          type="button"
          class="note-detail__child"
          @click="emit('select', kid)"
        >
          <span class="note-detail__child-title">{{ kid.title }}</span>
          <UIIcon icon="chevron-right" :size="15" />
        </button>
      </div>

      <SectionCadernoNoteLinks :node="node" :nodes="nodes" :links="links" />

      <div class="note-detail__actions">
        <UIButton
          variant="fantasma"
          icon="trash"
          label="Excluir"
          @click="emit('delete')"
        />
        <div class="note-detail__spacer" />
        <UIButton
          variant="leve"
          icon="check"
          label="Virar atividade"
          @click="promoteToActivity"
        />
        <UIButton
          variant="primal"
          icon="pencil"
          label="Editar"
          @click="emit('edit')"
        />
      </div>
    </div>
  </UIModal>
</template>

<style scoped>
.note-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.note-detail__aspects {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.note-detail__body {
  margin: 0;
}
.note-detail__empty {
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  margin: 0;
}
.note-detail__children {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.note-detail__child {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-family: inherit;
  font-size: calc(14px * var(--pt-text-scale));
  font-weight: 600;
  padding: 10px 12px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink);
  cursor: pointer;
}
.note-detail__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.note-detail__spacer {
  flex: 1;
}
</style>
