<script setup lang="ts">
const emit = defineEmits<{ demo: []; start: []; skip: [] }>();
</script>

<template>
  <div class="welcome-step">
    <div class="welcome-step__mark">📔</div>
    <h1 class="pt-hand welcome-step__title">Seu caderno</h1>
    <p class="welcome-step__sub">
      Suas faltas, presenças e atividades — organizadas do seu jeito, no seu
      aparelho.
    </p>
    <div class="welcome-step__actions">
      <UIButton variant="primal" full label="Criar o meu" @click="emit('start')" />
      <UIButton
        variant="fantasma"
        full
        label="Explorar com um exemplo"
        @click="emit('demo')"
      />
      <button type="button" class="welcome-step__skip" @click="emit('skip')">
        Pular configuração
      </button>
    </div>
  </div>
</template>

<style scoped>
.welcome-step {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.welcome-step__mark {
  font-size: calc(48px * var(--pt-text-scale));
  line-height: 1;
}
.welcome-step__title {
  font-size: calc(32px * var(--pt-text-scale));
  font-weight: 700;
  margin: 8px 0 0;
}
.welcome-step__sub {
  font-size: calc(14px * var(--pt-text-scale));
  line-height: 1.5;
  color: var(--pt-ink-muted);
  margin: 0;
  max-width: 320px;
}
.welcome-step__actions {
  display: flex;
  flex-direction: column;
  gap: 9px;
  width: 100%;
  margin-top: 18px;
}
.welcome-step__skip {
  background: none;
  border: none;
  font-family: inherit;
  font-size: calc(13px * var(--pt-text-scale));
  font-weight: 600;
  color: var(--pt-ink-muted);
  cursor: pointer;
  padding: 6px;
}
</style>
