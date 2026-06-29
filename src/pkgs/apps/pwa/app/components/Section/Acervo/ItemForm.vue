<script setup lang="ts">
import type { LibraryItem } from "@meu-caderno/core";

const props = defineProps<{ item?: LibraryItem }>();
const emit = defineEmits<{ done: []; cancel: []; delete: [] }>();

const { service } = useCadernoService();

const editing = computed(() => props.item != null);

const title = ref(props.item?.title ?? "");
const synopsis = ref(props.item?.synopsis ?? "");
const stars = ref(props.item?.stars ?? 0);
const progress = ref(Math.round((props.item?.progress ?? 0) * 100));
const saving = ref(false);

function setStars(value: number) {
  stars.value = stars.value === value ? 0 : value;
}

async function save() {
  const trimmed = title.value.trim();
  if (!trimmed || saving.value) return;
  saving.value = true;
  const fields = {
    title: trimmed,
    synopsis: synopsis.value.trim() || undefined,
    stars: stars.value > 0 ? stars.value : undefined,
    progress: progress.value > 0 ? progress.value / 100 : undefined,
  };
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
      <UIField label="Sinopse">
        <textarea
          v-model="synopsis"
          class="item-form__input item-form__textarea"
          rows="3"
          placeholder="Notas, descrição…"
        />
      </UIField>
      <UIField label="Avaliação">
        <div class="item-form__stars">
          <button
            v-for="n in 5"
            :key="n"
            type="button"
            class="item-form__star"
            :class="{ 'item-form__star--on': n <= stars }"
            :aria-label="`${n} estrelas`"
            @click="setStars(n)"
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
