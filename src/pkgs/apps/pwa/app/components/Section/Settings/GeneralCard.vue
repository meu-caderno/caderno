<script setup lang="ts">
const { open: openOnboarding } = useOnboarding();
const { restoreDefaults } = useTheme();
const { toast } = useToast();

const confirmingReset = ref(false);

async function reset() {
  confirmingReset.value = false;
  await restoreDefaults();
  toast({ title: "Padrões restaurados" });
}
</script>

<template>
  <UICard pad="18px" class="general-card">
    <div class="general-card__head">
      <h2 class="pt-hand general-card__title">Geral</h2>
      <p class="general-card__sub">Atalhos e telas.</p>
    </div>
    <div class="general-card__rows">
      <button type="button" class="general-card__row" @click="openOnboarding">
        <span class="general-card__icon">👋</span>
        <span class="general-card__text">
          <b>Rever introdução</b>
          <small>Reabrir o passo a passo de boas-vindas.</small>
        </span>
        <UIIcon icon="chevron-right" :size="16" />
      </button>
      <button
        type="button"
        class="general-card__row"
        @click="confirmingReset = true"
      >
        <span class="general-card__icon">↺</span>
        <span class="general-card__text">
          <b>Restaurar padrões</b>
          <small>Voltar o perfil da Home ao padrão.</small>
        </span>
        <UIIcon icon="chevron-right" :size="16" />
      </button>
    </div>

    <UIConfirm
      v-if="confirmingReset"
      title="Restaurar padrões?"
      description="Volta o perfil da Home (tom, cor e densidade) ao padrão. Seus dados não são afetados."
      confirm-label="Restaurar"
      @confirm="reset"
      @cancel="confirmingReset = false"
    />
  </UICard>
</template>

<style scoped>
.general-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.general-card__title {
  font-size: 19px;
  font-weight: 700;
  margin: 0;
}
.general-card__sub {
  font-size: 13px;
  color: var(--pt-ink-muted);
  margin: 4px 0 0;
}
.general-card__rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.general-card__row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  font-family: inherit;
  text-align: left;
  padding: 12px 14px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink);
  cursor: pointer;
}
.general-card__icon {
  font-size: 20px;
  line-height: 1;
  flex-shrink: 0;
}
.general-card__text {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.general-card__text b {
  font-size: 14px;
  font-weight: 600;
}
.general-card__text small {
  font-size: 12px;
  color: var(--pt-ink-muted);
}
</style>
