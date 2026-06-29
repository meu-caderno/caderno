<script setup lang="ts">
const profile = defineModel<string>("profile", { default: "calmo" });
const emit = defineEmits<{ finish: []; back: [] }>();

const profileOptions = [
  { value: "calmo", label: "🌿 Calmo", desc: "Tela enxuta, sem distração." },
  { value: "foco", label: "🎯 Foco", desc: "O essencial do dia em destaque." },
  {
    value: "tudo",
    label: "🎨 Tudo à mostra",
    desc: "Todos os widgets de uma vez.",
  },
];
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
  font-size: 26px;
  font-weight: 700;
  margin: 0;
}
.profile-step__sub {
  font-size: 14px;
  color: var(--pt-ink-muted);
  margin: -6px 0 4px;
}
</style>
