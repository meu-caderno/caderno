<script setup lang="ts">
import { Link } from "@meu-caderno/core";

const name = defineModel<string>("name", { default: "" });
const link = defineModel<string>("link", { default: Link.PERSONAL });
const nature = defineModel<string>("nature", { default: "" });
const emit = defineEmits<{ next: []; back: [] }>();

const linkOptions = [
  { value: Link.PERSONAL, label: "🧭 Pessoal", desc: "Só você." },
  {
    value: Link.CLASS,
    label: "🏫 Turma",
    desc: "Geralmente de uma disciplina.",
  },
  { value: Link.GROUP, label: "👥 Grupo", desc: "Pessoas que dividem várias." },
];

const canContinue = computed(() => name.value.trim().length > 0);
</script>

<template>
  <div class="context-step">
    <h2 class="pt-hand context-step__title">Seu primeiro contexto</h2>
    <p class="context-step__sub">
      Como você chama o que está estudando agora? Dá pra criar mais depois.
    </p>

    <UIField label="Nome">
      <input
        v-model="name"
        class="context-step__input"
        type="text"
        placeholder="Ex.: Faculdade, ENEM, Inglês…"
        @keyup.enter="canContinue && emit('next')"
      />
    </UIField>
    <UIField label="Tipo">
      <UIRadioGroup v-model="link" :options="linkOptions" />
    </UIField>
    <UIField label="Natureza" hint="Opcional — ex.: ensino médio integrado.">
      <input
        v-model="nature"
        class="context-step__input"
        type="text"
        placeholder="Ex.: Bacharelado em…"
      />
    </UIField>

    <UIButton
      variant="primal"
      full
      label="Continuar"
      :disabled="!canContinue"
      @click="emit('next')"
    />
  </div>
</template>

<style scoped>
.context-step {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.context-step__title {
  font-size: 26px;
  font-weight: 700;
  margin: 0;
}
.context-step__sub {
  font-size: 14px;
  line-height: 1.5;
  color: var(--pt-ink-muted);
  margin: -6px 0 4px;
}
.context-step__input {
  font-family: inherit;
  font-size: 16px;
  padding: 11px 13px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink);
  width: 100%;
}
.context-step__input:focus {
  outline: none;
  border-color: var(--pt-ink);
}
</style>
