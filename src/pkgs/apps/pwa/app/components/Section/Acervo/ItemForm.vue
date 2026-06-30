<script setup lang="ts">
import type { Id, LibraryItem, LibraryReview } from "@meu-caderno/core";
import { LibraryKind, LibraryState } from "@meu-caderno/core";

const props = defineProps<{ item?: LibraryItem }>();
const emit = defineEmits<{ done: []; cancel: []; delete: [] }>();

const { service } = useCadernoService();
const { effectiveId, contexts } = useActiveContext();

const editing = computed(() => props.item != null);

const title = ref(props.item?.title ?? "");
const synopsis = ref(props.item?.synopsis ?? "");
const stars = ref(props.item?.stars ?? 0);
const progress = ref(Math.round((props.item?.progress ?? 0) * 100));
const state = ref<LibraryState>(props.item?.state ?? LibraryState.WANT);
const kind = ref<LibraryKind | null>(props.item?.kind ?? null);
const personalNote = ref(props.item?.personalNote ?? "");
const linkedContexts = ref<Id[]>([...(props.item?.contextIds ?? [])]);
const saving = ref(false);

const currentReview = computed(() =>
  props.item?.reviews?.find((entry) => entry.contextId === effectiveId.value),
);
const review = ref(currentReview.value?.text ?? "");

function setStars(value: number) {
  stars.value = stars.value === value ? 0 : value;
}

function setKind(value: LibraryKind) {
  kind.value = kind.value === value ? null : value;
}

function toggleContext(id: Id) {
  linkedContexts.value = linkedContexts.value.includes(id)
    ? linkedContexts.value.filter((current) => current !== id)
    : [...linkedContexts.value, id];
}

function buildReviews(
  contextId: Id,
  text: string,
): LibraryReview[] | undefined {
  const others = (props.item?.reviews ?? []).filter(
    (entry) => entry.contextId !== contextId,
  );
  const next = text ? [...others, { contextId, text }] : others;
  return next.length ? next : undefined;
}

function buildFields(title: string) {
  const contextId = effectiveId.value;
  return {
    title,
    synopsis: synopsis.value.trim() || undefined,
    stars: stars.value > 0 ? stars.value : undefined,
    progress: progress.value > 0 ? progress.value / 100 : undefined,
    state: state.value,
    kind: kind.value ?? undefined,
    personalNote: personalNote.value.trim() || undefined,
    contextIds: linkedContexts.value.length ? linkedContexts.value : undefined,
    reviews: contextId
      ? buildReviews(contextId, review.value.trim())
      : props.item?.reviews,
  };
}

async function save() {
  const trimmed = title.value.trim();
  if (!trimmed || saving.value) return;
  saving.value = true;
  const fields = buildFields(trimmed);
  const res = props.item
    ? await service.updateLibraryItem({ ...props.item, ...fields })
    : await service.addLibraryItem(fields);
  saving.value = false;
  if (res.ok) emit("done");
}
</script>

<template>
  <UIModal
    :title="editing ? 'Editar item' : 'Novo item'"
    subtitle="livro, artigo, vídeo…"
    @close="emit('cancel')"
  >
    <div class="item-form">
      <UIField label="Título">
        <input
          v-model="title"
          class="item-form__input"
          type="text"
          placeholder="Ex.: Cálculo · Stewart"
          @keyup.enter="save"
        />
      </UIField>
      <UIField label="Tipo">
        <div class="item-form__chips">
          <UIChip
            v-for="option in LIBRARY_KIND_OPTIONS"
            :key="option.value"
            :label="option.label"
            :selected="kind === option.value"
            @click="setKind(option.value)"
          />
        </div>
      </UIField>
      <UIField label="Sinopse">
        <textarea
          v-model="synopsis"
          class="item-form__input item-form__textarea"
          rows="3"
          placeholder="Notas, descrição…"
        />
      </UIField>
      <UIField label="Estado">
        <div class="item-form__chips">
          <UIChip
            v-for="option in LIBRARY_STATE_OPTIONS"
            :key="option.value"
            :label="option.label"
            :selected="state === option.value"
            @click="state = option.value"
          />
        </div>
      </UIField>
      <UIField
        label="Nota pessoal"
        hint="privada · só você vê, não aparece nos contextos"
      >
        <textarea
          v-model="personalNote"
          class="item-form__input item-form__textarea"
          rows="2"
          placeholder="Lembrete pessoal, por que adicionou…"
        />
      </UIField>
      <UIField
        v-if="contexts.length"
        label="Vincular contextos"
        hint="onde este item é relevante"
      >
        <div class="item-form__chips">
          <UIChip
            v-for="ctx in contexts"
            :key="ctx.id"
            :label="ctx.name"
            :selected="linkedContexts.includes(ctx.id)"
            @click="toggleContext(ctx.id)"
          />
        </div>
      </UIField>
      <UIField label="Resenha do contexto">
        <textarea
          v-model="review"
          class="item-form__input item-form__textarea"
          rows="3"
          placeholder="Sua resenha neste contexto…"
        />
      </UIField>
      <UIField label="Avaliação">
        <div class="item-form__stars">
          <button
            v-for="starValue in 5"
            :key="starValue"
            type="button"
            class="item-form__star"
            :class="{ 'item-form__star--on': starValue <= stars }"
            :aria-label="`${starValue} estrelas`"
            @click="setStars(starValue)"
          >
            ★
          </button>
        </div>
      </UIField>
      <UIField :label="`Progresso · ${progress}%`">
        <UISlider
          :model-value="[progress]"
          :min="0"
          :max="100"
          :step="5"
          @update:model-value="progress = $event?.[0] ?? 0"
        />
      </UIField>

      <div class="item-form__actions">
        <UIButton
          v-if="editing"
          variant="fantasma"
          icon="trash"
          label="Remover"
          @click="emit('delete')"
        />
        <div class="item-form__spacer" />
        <UIButton variant="fantasma" label="Cancelar" @click="emit('cancel')" />
        <UIButton
          variant="primal"
          icon="check"
          :label="
            saving ? 'Salvando…' : editing ? 'Salvar' : 'Adicionar'
          "
          @click="save"
        />
      </div>
    </div>
  </UIModal>
</template>

<style scoped>
.item-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.item-form__input {
  font-family: inherit;
  font-size: calc(15px * var(--pt-text-scale));
  padding: 10px 12px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink);
  width: 100%;
}
.item-form__input:focus {
  outline: none;
  border-color: var(--pt-ink);
}
.item-form__textarea {
  resize: vertical;
}
.item-form__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.item-form__stars {
  display: flex;
  gap: 4px;
}
.item-form__star {
  font-size: calc(24px * var(--pt-text-scale));
  line-height: 1;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--pt-border-muted);
  padding: 0;
}
.item-form__star--on {
  color: var(--pt-warn);
}
.item-form__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}
.item-form__spacer {
  flex: 1;
}
</style>
