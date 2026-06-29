<script setup lang="ts">
import { useTheme } from "~/composables/useTheme";

const { zen, setZen } = useTheme();
</script>

<template>
  <div class="shell" :class="{ 'shell--zen': zen }">
    <SectionShellRail v-if="!zen" class="shell__rail" />
    <main class="shell__content">
      <slot />
    </main>
    <SectionShellTabBar v-if="!zen" class="shell__tabbar" />
    <button
      v-if="zen"
      type="button"
      class="shell__exit-zen"
      @click="setZen(false)"
    >
      <UIIcon icon="x" :size="16" /> sair do foco
    </button>
  </div>
</template>

<style scoped>
.shell {
  min-height: 100vh;
}
.shell__rail {
  display: none;
}
.shell__content {
  min-width: 0;
  padding-bottom: 72px;
}

@media (min-width: 960px) {
  .shell:not(.shell--zen) {
    display: grid;
    grid-template-columns: 224px 1fr;
    align-items: start;
  }
  .shell:not(.shell--zen) .shell__rail {
    display: flex;
    position: sticky;
    top: 0;
  }
  .shell:not(.shell--zen) .shell__content {
    padding-bottom: 0;
  }
  .shell__tabbar {
    display: none;
  }
}

.shell--zen .shell__content {
  padding-bottom: 0;
}
.shell__exit-zen {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 40;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: inherit;
  font-size: calc(13px * var(--pt-text-scale));
  font-weight: 600;
  padding: 9px 14px;
  border-radius: var(--pt-radius-pill);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink-soft);
  box-shadow: var(--pt-shadow-strong);
  cursor: pointer;
}
</style>
