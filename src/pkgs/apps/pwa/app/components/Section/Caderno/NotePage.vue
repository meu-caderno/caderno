<script setup lang="ts">
import type { Id, Subject } from "@meu-caderno/core";
import {
  ActivityKind,
  ActivityStatus,
  Aspect,
  ancestors,
  Mastery,
  Root,
} from "@meu-caderno/core";
import { MASTERY_LABEL } from "~/utils/concepts";

const props = defineProps<{ nodeId: Id }>();
const emit = defineEmits<{ close: []; open: [id: Id] }>();

const { nodes, linksOf, childrenOf } = useNotebook();
const { service, store, ids } = useCadernoService();
const { toast } = useToast();

const subjects = useLiveQuery(
  ["subjects"],
  () => store.subjects.list(),
  [] as Subject[],
);
const subjectOptions = computed(() => [
  { value: "", label: "— sem disciplina —" },
  ...subjects.value.map((subject) => ({
    value: subject.id as string,
    label: subject.name,
  })),
]);

const ASPECT_OPTIONS = [
  { value: Aspect.NOTE, label: "Nota" },
  { value: Aspect.CONCEPT, label: "Conceito" },
  { value: Aspect.TASK, label: "Tarefa" },
  { value: Aspect.WORK, label: "Trabalho" },
];
const MASTERY_STEPS = [Mastery.UNKNOWN, Mastery.STUDYING, Mastery.MASTERED];

const node = computed(
  () => nodes.value.find((entry) => entry.id === props.nodeId) ?? null,
);
const crumbs = computed(() =>
  node.value ? ancestors(nodes.value, node.value.id) : [],
);
const kids = computed(() => (node.value ? childrenOf(node.value.id) : []));
const links = computed(() => (node.value ? linksOf(node.value.id) : []));
const isConcept = computed(() => aspects.value.includes(Aspect.CONCEPT));

const title = ref("");
const body = ref("");
const aspects = ref<Aspect[]>([]);
const anchorSubject = ref<string>("");
const mastery = ref<Mastery>(Mastery.UNKNOWN);
const anchorOpen = ref(false);
const deleting = ref(false);
const saveState = ref<"idle" | "saving" | "saved">("idle");

let loading = false;
let timer: ReturnType<typeof setTimeout> | null = null;

watch(
  node,
  (current) => {
    if (!current) return;
    loading = true;
    title.value = current.title;
    body.value = current.body ?? "";
    aspects.value = [...current.aspects];
    anchorSubject.value = current.subjectId ?? "";
    mastery.value = current.mastery ?? Mastery.UNKNOWN;
    saveState.value = "idle";
    nextTick(() => {
      loading = false;
    });
  },
  { immediate: true },
);

async function persist() {
  const current = node.value;
  if (!current) return;
  await service.updateNode({
    ...current,
    title: title.value.trim() || "Sem título",
    body: body.value.trim() || undefined,
    aspects: aspects.value.length ? aspects.value : [Aspect.NOTE],
    subjectId: anchorSubject.value ? (anchorSubject.value as Id) : undefined,
    mastery: aspects.value.includes(Aspect.CONCEPT) ? mastery.value : undefined,
  });
  saveState.value = "saved";
}

watch([title, body, aspects, anchorSubject, mastery], () => {
  if (loading) return;
  saveState.value = "saving";
  if (timer) clearTimeout(timer);
  timer = setTimeout(persist, 600);
});

const anchorName = computed(
  () =>
    subjects.value.find((subject) => subject.id === anchorSubject.value)?.name,
);

async function addSubpage() {
  const result = await service.createNode({
    title: "Nova subpágina",
    aspects: [Aspect.NOTE],
    parentId: props.nodeId,
  });
  if (result.ok) emit("open", result.value.id);
}

async function confirmDelete() {
  deleting.value = false;
  const current = node.value;
  if (!current) return;
  await service.deleteNode(current.id);
  emit("close");
}

async function promoteToActivity() {
  const current = node.value;
  if (!current) return;
  const result = await service.upsertActivity({
    id: await ids.newId(),
    title: current.title,
    kind: ActivityKind.TASK,
    status: ActivityStatus.OPEN,
    root: Root.CONTEXT,
    subjectId: current.subjectId,
    contextId: current.contextId,
  });
  if (result.ok) toast({ title: `“${current.title}” virou atividade` });
}
</script>

<template>
  <div v-if="node" class="note-page">
    <div class="note-page__bar">
      <button
        type="button"
        class="note-page__back"
        aria-label="Voltar"
        @click="emit('close')"
      >
        <UIIcon icon="chevron-left" :size="16" /> Notas
      </button>
      <nav class="note-page__crumbs">
        <button
          v-for="crumb in crumbs"
          :key="crumb.id"
          type="button"
          class="note-page__crumb"
          @click="emit('open', crumb.id)"
        >
          {{ crumb.title }} ›
        </button>
      </nav>
      <span class="note-page__save">
        <span v-if="saveState === 'saving'" class="note-page__saving">
          ✍ salvando…
        </span>
        <span v-else-if="saveState === 'saved'" class="note-page__saved">
          ✓ salvo
        </span>
      </span>
    </div>

    <input v-model="title" class="pt-hand note-page__title" aria-label="Título" />

    <UIToggleGroup v-model="aspects" :options="ASPECT_OPTIONS" multiple />

    <div v-if="isConcept" class="note-page__mastery">
      <span class="pt-eyebrow">◐ domínio</span>
      <div class="note-page__seg">
        <button
          v-for="step in MASTERY_STEPS"
          :key="step"
          type="button"
          class="note-page__seg-btn"
          :class="{ 'note-page__seg-btn--on': mastery === step }"
          @click="mastery = step"
        >
          {{ MASTERY_LABEL[step] }}
        </button>
      </div>
    </div>

    <div class="note-page__anchor">
      <button
        v-if="!anchorOpen"
        type="button"
        class="note-page__anchor-chip"
        @click="anchorOpen = true"
      >
        ⚓ {{ anchorName ? `Pertence a ${anchorName}` : "Pertence a…" }}
      </button>
      <UIField v-else label="⚓ Pertence a (disciplina)">
        <UISelect v-model="anchorSubject" :options="subjectOptions" />
      </UIField>
    </div>

    <UIRichTextEditor v-model="body" placeholder="Escreva a nota…" />

    <section class="note-page__subs">
      <div class="note-page__subs-head">
        <span class="pt-eyebrow">▾ Subpáginas</span>
        <UIButton
          variant="fantasma"
          icon="plus"
          label="Nova subpágina"
          @click="addSubpage"
        />
      </div>
      <button
        v-for="kid in kids"
        :key="kid.id"
        type="button"
        class="note-page__sub"
        @click="emit('open', kid.id)"
      >
        <span class="note-page__sub-title">{{ kid.title }}</span>
        <UIIcon icon="chevron-right" :size="15" />
      </button>
      <p v-if="!kids.length" class="note-page__empty">Sem subpáginas.</p>
    </section>

    <SectionCadernoNoteLinks :node="node" :nodes="nodes" :links="links" />

    <div class="note-page__actions">
      <UIButton
        variant="fantasma"
        icon="trash"
        label="Excluir nota"
        @click="deleting = true"
      />
      <div class="note-page__spacer" />
      <UIButton
        variant="leve"
        icon="check"
        label="Virar atividade"
        @click="promoteToActivity"
      />
    </div>

    <UIConfirm
      v-if="deleting"
      title="Excluir nota?"
      :description="`Remove ${node.title}. As sub-notas sobem um nível e as conexões são apagadas.`"
      confirm-label="Excluir"
      danger
      @confirm="confirmDelete"
      @cancel="deleting = false"
    />
  </div>
</template>

<style scoped>
.note-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 680px;
}
.note-page__bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding-bottom: 8px;
  border-bottom: 1.5px solid var(--pt-border-faint);
}
.note-page__back {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  border: none;
  background: none;
  color: var(--pt-info);
  font-family: inherit;
  font-size: calc(13px * var(--pt-text-scale));
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
}
.note-page__crumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
  min-width: 0;
}
.note-page__crumb {
  border: none;
  background: none;
  color: var(--pt-ink-muted);
  font-family: inherit;
  font-size: calc(12px * var(--pt-text-scale));
  cursor: pointer;
}
.note-page__save {
  flex-shrink: 0;
  font-size: calc(12px * var(--pt-text-scale));
}
.note-page__saving {
  color: var(--pt-ink-muted);
}
.note-page__saved {
  color: var(--pt-ok);
  font-weight: 600;
}
.note-page__title {
  font-size: calc(32px * var(--pt-text-scale));
  font-weight: 700;
  line-height: 1.05;
  border: none;
  border-bottom: 2px dashed transparent;
  background: transparent;
  color: var(--pt-ink);
  outline: none;
  padding: 0 0 3px;
}
.note-page__title:focus {
  border-bottom-color: var(--pt-border-muted);
}
.note-page__mastery {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
}
.note-page__seg {
  display: flex;
  border: 1.5px solid var(--pt-border-faint);
  border-radius: var(--pt-radius-pill);
  overflow: hidden;
}
.note-page__seg-btn {
  border: none;
  background: var(--pt-card);
  color: var(--pt-ink-soft);
  font-family: inherit;
  font-size: calc(12px * var(--pt-text-scale));
  padding: 5px 11px;
  cursor: pointer;
}
.note-page__seg-btn--on {
  background: var(--pt-accent);
  color: var(--pt-on-accent);
}
.note-page__anchor-chip {
  align-self: flex-start;
  border: 1.5px dashed var(--pt-info);
  border-radius: var(--pt-radius-pill);
  background: none;
  color: var(--pt-info);
  font-family: inherit;
  font-size: calc(12px * var(--pt-text-scale));
  font-weight: 600;
  padding: 4px 12px;
  cursor: pointer;
}
.note-page__subs {
  display: flex;
  flex-direction: column;
  gap: 7px;
  border-top: 1.5px solid var(--pt-border-faint);
  padding-top: 14px;
}
.note-page__subs-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.note-page__sub {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 11px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-faint);
  background: var(--pt-card);
  color: var(--pt-ink);
  font-family: inherit;
  font-size: calc(14px * var(--pt-text-scale));
  text-align: left;
  cursor: pointer;
}
.note-page__sub-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.note-page__empty {
  margin: 0;
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink-faint);
}
.note-page__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.note-page__spacer {
  flex: 1;
}
</style>
