<script setup lang="ts">
import { MOODS } from "~/composables/useTheme";

const profile = defineModel<string>("profile", { default: "calmo" });
const emit = defineEmits<{ finish: []; back: [] }>();

const profileOptions = MOODS.map((mood) => ({
  value: mood.key,
  label: `${mood.emoji} ${mood.label}`,
  desc: mood.blurb,
}));
</script>

<template>
  <div class="profile-step">
    <h2 class="pt-hand profile-step__title">Como quer começar?</h2>
    <p class="profile-step__sub">
      Escolha um jeito pra Home. Dá pra trocar e personalizar quando quiser.
    </p>

    <UIRadioGroup v-model="profile" :options="profileOptions" />

    <UIButton
      variant="primal"
      full
      icon="check"
      label="Criar meu caderno"
      @click="emit('finish')"
    />
  </div>
</template>

<style scoped>
.profile-step {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.profile-step__title {
  font-size: calc(26px * var(--pt-text-scale));
  font-weight: 700;
  margin: 0;
}
.profile-step__sub {
  font-size: calc(14px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  margin: -6px 0 4px;
}
</style>
