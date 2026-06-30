<script setup lang="ts">
defineProps<{ pending: number; classes: number }>();
const emit = defineEmits<{ dismiss: [] }>();
</script>

<template>
  <section class="welcome-back">
    <div class="welcome-back__body">
      <span class="welcome-back__wave">👋</span>
      <div class="welcome-back__text">
        <b class="pt-hand">Bem-vindo de volta</b>
        <span class="welcome-back__summary">
          <template v-if="classes"
            >{{ classes }} aula(s) hoje</template
          ><template v-if="classes && pending"> · </template
          ><template v-if="pending">{{ pending }} pendente(s)</template
          ><template v-if="!classes && !pending">tudo em dia por aqui</template>
        </span>
      </div>
    </div>
    <button
      type="button"
      class="welcome-back__close"
      aria-label="Dispensar"
      @click="emit('dismiss')"
    >
      <UIIcon icon="x" :size="16" />
    </button>
  </section>
</template>

<style scoped>
.welcome-back {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: var(--pt-radius);
  border: 1.5px solid var(--pt-accent);
  background: var(--pt-card);
}
.welcome-back__body {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.welcome-back__wave {
  font-size: calc(24px * var(--pt-text-scale));
  line-height: 1;
}
.welcome-back__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.welcome-back__text b {
  font-size: calc(18px * var(--pt-text-scale));
  font-weight: 700;
}
.welcome-back__summary {
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
.welcome-back__close {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: var(--pt-radius-sm);
  border: none;
  background: var(--pt-paper-2);
  color: var(--pt-ink-soft);
  cursor: pointer;
}
</style>
