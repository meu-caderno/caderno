<script setup lang="ts">
const route = useRoute();
const { items, activate, close } = useWorkbenchTabs();
const searching = useState("shell:search", () => false);

const stripEl = ref<HTMLElement | null>(null);
watch(
  () => route.path,
  async () => {
    await nextTick();
    stripEl.value
      ?.querySelector(".tabstrip__tab--on")
      ?.scrollIntoView({ inline: "nearest", block: "nearest" });
  },
);
</script>

<template>
  <div v-if="items.length > 1" ref="stripEl" class="tabstrip">
    <div
      v-for="tab in items"
      :key="tab.path"
      class="tabstrip__tab"
      :class="{ 'tabstrip__tab--on': tab.path === route.path }"
    >
      <button
        type="button"
        class="tabstrip__main"
        :title="tab.label"
        @click="activate(tab.path)"
      >
        <span class="tabstrip__icon">{{ tab.icon }}</span>
        <span class="tabstrip__label">{{ tab.label }}</span>
      </button>
      <button
        type="button"
        class="tabstrip__close"
        aria-label="Fechar aba"
        @click="close(tab.path)"
      >
        ×
      </button>
    </div>
    <button
      type="button"
      class="tabstrip__new"
      aria-label="Nova aba (buscar)"
      title="Abrir tela (⌘K)"
      @click="searching = true"
    >
      ＋
    </button>
  </div>
</template>

<style scoped>
.tabstrip {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  padding: 6px 12px 0;
  background: var(--pt-paper-2);
  border-bottom: 1.5px solid var(--pt-border-faint);
  overflow-x: auto;
}
.tabstrip__tab {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  max-width: 200px;
  border-radius: var(--pt-radius-sm) var(--pt-radius-sm) 0 0;
  background: transparent;
  color: var(--pt-ink-muted);
}
.tabstrip__tab--on {
  background: var(--pt-card);
  color: var(--pt-ink);
  box-shadow: var(--pt-shadow);
}
.tabstrip__main {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding: 7px 4px 8px 11px;
  border: none;
  background: none;
  color: inherit;
  font-family: inherit;
  font-size: calc(13px * var(--pt-text-scale));
  cursor: pointer;
}
.tabstrip__icon {
  flex-shrink: 0;
}
.tabstrip__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tabstrip__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-right: 6px;
  border: none;
  border-radius: 5px;
  background: none;
  color: var(--pt-ink-faint);
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
}
.tabstrip__close:hover {
  background: var(--pt-linen);
  color: var(--pt-ink);
}
.tabstrip__new {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  margin: 0 0 4px 2px;
  border: none;
  border-radius: var(--pt-radius-sm);
  background: none;
  color: var(--pt-ink-muted);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
}
.tabstrip__new:hover {
  background: var(--pt-card);
  color: var(--pt-ink);
}
</style>
