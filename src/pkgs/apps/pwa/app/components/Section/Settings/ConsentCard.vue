<script setup lang="ts">
import { CONSENTS, useConsent } from "~/composables/useConsent";

const { hasConsent, toggleConsent } = useConsent();
</script>

<template>
  <UICard pad="18px" class="consent-card">
    <div class="consent-card__head">
      <h2 class="pt-hand consent-card__title">Gatilhos & avisos</h2>
      <p class="consent-card__sub">
        O app avisa, nunca obriga. Revogue quando quiser.
      </p>
    </div>
    <div
      v-for="item in CONSENTS"
      :key="item.key"
      class="consent-card__row"
    >
      <div class="consent-card__text">
        <b>{{ item.label }}</b>
        <small>{{ item.blurb }}</small>
      </div>
      <UISwitch
        :model-value="hasConsent(item.key)"
        @update:model-value="toggleConsent(item.key)"
      />
    </div>
  </UICard>
</template>

<style scoped>
.consent-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.consent-card__title {
  font-size: calc(19px * var(--pt-text-scale));
  font-weight: 700;
  margin: 0;
}
.consent-card__sub {
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  margin: 4px 0 0;
}
.consent-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.consent-card__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.consent-card__text b {
  font-size: calc(14px * var(--pt-text-scale));
  font-weight: 600;
}
.consent-card__text small {
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
</style>
