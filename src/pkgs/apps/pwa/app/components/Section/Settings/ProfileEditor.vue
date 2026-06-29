<script setup lang="ts">
import { Background, Density } from "@meu-caderno/core";
import {
  ACCENT_OPTIONS,
  BACKGROUND_OPTIONS,
  DENSITY_OPTIONS,
  useTheme,
} from "~/composables/useTheme";

const emit = defineEmits<{ done: []; cancel: [] }>();

const { saveProfile } = useTheme();

const name = ref("");
const background = ref<Background>(Background.PAPER);
const accent = ref<string>(ACCENT_OPTIONS[0] ?? "#3f6fb0");
const density = ref<Density>(Density.NORMAL);
const saving = ref(false);

async function save() {
  if (saving.value) return;
  saving.value = true;
  await saveProfile({
    name: name.value,
    background: background.value,
    accent: accent.value,
    density: density.value,
  });
  saving.value = false;
  emit("done");
}
</script>

<template>
  <UIModal
    title="Novo perfil"
    subtitle="seu jeito de ver a Home"
    @close="emit('cancel')"
  >
    <div class="profile-editor">
      <UIField label="Nome">
        <input
          v-model="name"
          class="profile-editor__input"
          type="text"
          placeholder="Ex.: Noite calma"
          @keyup.enter="save"
        />
      </UIField>

      <UIField label="Fundo">
        <div class="profile-editor__row">
          <button
            v-for="option in BACKGROUND_OPTIONS"
            :key="option.value"
            type="button"
            class="profile-editor__chip"
            :class="{ 'profile-editor__chip--on': option.value === background }"
            @click="background = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </UIField>

      <UIField label="Cor de destaque">
        <div class="profile-editor__swatches">
          <button
            v-for="color in ACCENT_OPTIONS"
            :key="color"
            type="button"
            class="profile-editor__swatch"
            :class="{ 'profile-editor__swatch--on': color === accent }"
            :style="{ background: color }"
            :aria-label="`Cor ${color}`"
            @click="accent = color"
          />
        </div>
      </UIField>

      <UIField label="Densidade">
        <div class="profile-editor__row">
          <button
            v-for="option in DENSITY_OPTIONS"
            :key="option.value"
            type="button"
            class="profile-editor__chip"
            :class="{ 'profile-editor__chip--on': option.value === density }"
            @click="density = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </UIField>

      <div class="profile-editor__actions">
        <UIButton variant="fantasma" label="Cancelar" @click="emit('cancel')" />
        <UIButton
          variant="primal"
          icon="check"
          :label="saving ? 'Salvando…' : 'Salvar perfil'"
          @click="save"
        />
      </div>
    </div>
  </UIModal>
</template>

<style scoped>
.profile-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.profile-editor__input {
  font-family: inherit;
  font-size: calc(15px * var(--pt-text-scale));
  padding: 10px 12px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink);
  width: 100%;
}
.profile-editor__input:focus {
  outline: none;
  border-color: var(--pt-accent);
}
.profile-editor__row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.profile-editor__chip {
  font-family: inherit;
  font-size: calc(13px * var(--pt-text-scale));
  font-weight: 600;
  padding: 9px 14px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink-soft);
  cursor: pointer;
}
.profile-editor__chip--on {
  border-color: var(--pt-accent);
  color: var(--pt-ink);
}
.profile-editor__swatches {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.profile-editor__swatch {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
}
.profile-editor__swatch--on {
  border-color: var(--pt-ink);
}
.profile-editor__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}
</style>
