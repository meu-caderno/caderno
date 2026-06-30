<script setup lang="ts">
import type { Id, NotebookNode } from "@meu-caderno/core";

const props = defineProps<{ node: NotebookNode }>();
const emit = defineEmits<{ open: [id: Id] }>();

const { service } = useCadernoService();

const expanded = ref(false);
const title = ref("");
const body = ref("");
const saveState = ref<"idle" | "saving" | "saved">("idle");

let loading = false;
let timer: ReturnType<typeof setTimeout> | null = null;

watch(
  () => props.node,
  (current) => {
    loading = true;
    title.value = current.title;
    body.value = current.body ?? "";
    saveState.value = "idle";
    nextTick(() => {
      loading = false;
    });
  },
  { immediate: true },
);

async function persist() {
  await service.updateNode({
    ...props.node,
    title: title.value.trim() || "Sem título",
    body: body.value.trim() || undefined,
  });
  saveState.value = "saved";
}

watch([title, body], () => {
  if (loading) return;
  saveState.value = "saving";
  if (timer) clearTimeout(timer);
  timer = setTimeout(persist, 600);
});
</script>

<template>
  <div class="sub" :class="{ 'sub--open': expanded }">
    <div class="sub__row">
      <button
        type="button"
        class="sub__toggle"
        :aria-label="expanded ? 'Recolher' : 'Editar aqui'"
        @click="expanded = !expanded"
      >
        <UIIcon :icon="expanded ? 'chevron-down' : 'chevron-right'" :size="15" />
      </button>
      <button type="button" class="sub__open" @click="emit('open', node.id)">
        <span class="sub__title">{{ node.title || "Sem título" }}</span>
        <span class="sub__open-hint">abrir ›</span>
      </button>
    </div>
    <div v-if="expanded" class="sub__edit">
      <input
        v-model="title"
        class="sub__title-input"
        aria-label="Título da subpágina"
      />
      <UIRichTextEditor v-model="body" placeholder="Escreva a subpágina…" />
      <span class="sub__save">
        <span v-if="saveState === 'saving'">✍ salvando…</span>
        <span v-else-if="saveState === 'saved'" class="sub__saved">✓ salvo</span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.sub {
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-faint);
  background: var(--pt-card);
  overflow: hidden;
}
.sub--open {
  border-color: var(--pt-border-muted);
}
.sub__row {
  display: flex;
  align-items: center;
}
.sub__toggle {
  display: inline-flex;
  align-items: center;
  border: none;
  background: none;
  color: var(--pt-ink-muted);
  padding: 9px 8px 9px 11px;
  cursor: pointer;
}
.sub__open {
  display: flex;
  align-items: center;
  gap: 9px;
  flex: 1;
  min-width: 0;
  border: none;
  background: none;
  color: var(--pt-ink);
  font-family: inherit;
  font-size: calc(14px * var(--pt-text-scale));
  text-align: left;
  padding: 9px 11px 9px 0;
  cursor: pointer;
}
.sub__title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sub__open-hint {
  flex-shrink: 0;
  font-size: calc(11px * var(--pt-text-scale));
  color: var(--pt-ink-faint);
}
.sub__edit {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 11px 11px;
  border-top: 1px solid var(--pt-border-faint);
}
.sub__title-input {
  border: none;
  border-bottom: 2px dashed transparent;
  background: transparent;
  color: var(--pt-ink);
  font-family: inherit;
  font-size: calc(16px * var(--pt-text-scale));
  font-weight: 600;
  outline: none;
  padding: 8px 0 3px;
}
.sub__title-input:focus {
  border-bottom-color: var(--pt-border-muted);
}
.sub__save {
  align-self: flex-end;
  font-size: calc(11px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
.sub__saved {
  color: var(--pt-ok);
  font-weight: 600;
}
</style>
