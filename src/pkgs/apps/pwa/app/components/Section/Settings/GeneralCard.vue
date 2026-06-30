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
  <SectionSettingsCard title="Geral" subtitle="Atalhos e telas.">
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
  </SectionSettingsCard>
</template>

<style scoped>
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
  font-size: calc(20px * var(--pt-text-scale));
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
  font-size: calc(14px * var(--pt-text-scale));
  font-weight: 600;
}
.general-card__text small {
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
</style>
