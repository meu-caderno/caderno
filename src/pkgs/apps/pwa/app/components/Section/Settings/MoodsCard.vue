<script setup lang="ts">
import { useTheme } from "~/composables/useTheme";

const { moodKey, allMoods, setMood, deleteProfile } = useTheme();

const creating = ref(false);
const removing = ref<string | null>(null);

const removingLabel = computed(
  () => allMoods.value.find((mood) => mood.key === removing.value)?.label ?? "",
);

function choose(key: string) {
  if (key !== moodKey.value) setMood(key);
}
async function confirmRemove() {
  const key = removing.value;
  removing.value = null;
  if (key) await deleteProfile(key);
}
</script>

<template>
  <SectionSettingsCard
    title="Perfil da Home"
    subtitle="Define o tom do papel, a cor de destaque e a densidade."
  >
    <div class="moods-card__grid">
      <button
        v-for="mood in allMoods"
        :key="mood.key"
        type="button"
        class="moods-card__mood"
        :class="{ 'moods-card__mood--on': mood.key === moodKey }"
        @click="choose(mood.key)"
      >
        <span class="moods-card__emoji">{{ mood.emoji }}</span>
        <span class="moods-card__label">{{ mood.label }}</span>
        <span class="moods-card__blurb">{{ mood.blurb }}</span>
        <span class="moods-card__accent" :style="{ background: mood.accent }" />
        <span
          v-if="mood.custom"
          class="moods-card__remove"
          role="button"
          tabindex="0"
          aria-label="Remover perfil"
          @click.stop="removing = mood.key"
          @keydown.enter.stop="removing = mood.key"
        >
          <UIIcon icon="trash" :size="13" />
        </span>
      </button>
    </div>

    <UIButton
      variant="fantasma"
      icon="plus"
      label="Criar perfil"
      @click="creating = true"
    />

    <SectionSettingsProfileEditor
      v-if="creating"
      @done="creating = false"
      @cancel="creating = false"
    />
    <UIConfirm
      v-if="removing"
      title="Remover perfil?"
      :description="`Remove o perfil ${removingLabel}.`"
      confirm-label="Remover"
      danger
      @confirm="confirmRemove"
      @cancel="removing = null"
    />
  </SectionSettingsCard>
</template>

<style scoped>
.moods-card__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}
.moods-card__mood {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
  font-family: inherit;
  padding: 12px 14px;
  border-radius: var(--pt-radius);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink);
  cursor: pointer;
}
.moods-card__mood--on {
  border-color: var(--pt-ink);
}
.moods-card__emoji {
  font-size: calc(22px * var(--pt-text-scale));
  line-height: 1;
}
.moods-card__label {
  font-size: calc(14px * var(--pt-text-scale));
  font-weight: 700;
}
.moods-card__blurb {
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
.moods-card__accent {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.moods-card__remove {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: var(--pt-radius-sm);
  background: var(--pt-paper-2);
  color: var(--pt-ink-muted);
  cursor: pointer;
}
</style>
