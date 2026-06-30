<script setup lang="ts">
import type { Workbench } from "@meu-caderno/core";
import { NAV_ITEMS } from "~/composables/useNav";

const { railItems, ordered } = useLayout();
const { open: openFocus } = useFocus();
const { benches, invoke } = useWorkbenches();
const dockScreen = useState<string | null>("shell:dock", () => null);
const isWide = useMediaQuery("(min-width: 1100px)");
function toggleDock() {
  dockScreen.value = dockScreen.value === null ? "/caderno" : null;
}
const navKeys = NAV_ITEMS.map((item) => item.key);
const items = computed(() =>
  ordered(railItems.value, navKeys)
    .map((key) => NAV_ITEMS.find((item) => item.key === key))
    .filter((item): item is (typeof NAV_ITEMS)[number] => item != null),
);

function onBench(bench: Workbench) {
  invoke(bench);
}
</script>

<template>
  <aside class="rail">
    <div class="rail__brand">
      <span class="rail__mark">📔</span>
      <span class="pt-hand rail__name">Caderno</span>
    </div>
    <nav class="rail__nav">
      <SectionShellNavItem
        v-for="item in items"
        :key="item.key"
        :to="item.to"
        :icon="item.icon"
        :label="item.label"
        layout="rail"
      />
    </nav>

    <button type="button" class="rail__focus" @click="openFocus">
      <span class="rail__focus-icon">⏳</span> Foco
    </button>
    <button
      v-if="isWide"
      type="button"
      class="rail__focus"
      :class="{ 'rail__focus--on': dockScreen !== null }"
      @click="toggleDock"
    >
      <span class="rail__focus-icon">🗂️</span> Tela ao lado
    </button>

    <SectionShellContextTree />

    <div v-if="benches.length" class="rail__benches">
      <span class="pt-eyebrow rail__benches-title">Bancadas</span>
      <button
        v-for="bench in benches"
        :key="bench.id"
        type="button"
        class="rail__bench"
        @click="onBench(bench)"
      >
        {{ bench.name }}
      </button>
    </div>

    <div class="rail__foot">Tudo neste aparelho</div>
  </aside>
</template>

<style scoped>
.rail {
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 100vh;
  padding: 18px 13px;
  border-right: 2px solid var(--pt-ink);
  background: var(--pt-paper-soft, var(--pt-paper));
}
.rail__brand {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 4px 12px 14px;
}
.rail__mark {
  font-size: calc(24px * var(--pt-text-scale));
  line-height: 1;
}
.rail__name {
  font-size: calc(22px * var(--pt-text-scale));
  font-weight: 700;
}
.rail__nav {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.rail__focus {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink);
  font-family: inherit;
  font-size: calc(14px * var(--pt-text-scale));
  font-weight: 600;
  cursor: pointer;
}
.rail__focus--on {
  background: var(--pt-accent);
  color: var(--pt-on-accent);
  border-color: var(--pt-accent);
}
.rail__focus-icon {
  font-size: calc(17px * var(--pt-text-scale));
  line-height: 1;
}
.rail__benches {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 14px;
}
.rail__benches-title {
  padding: 0 12px 2px;
}
.rail__bench {
  text-align: left;
  padding: 8px 12px;
  border-radius: var(--pt-radius-sm);
  border: none;
  background: none;
  color: var(--pt-ink-soft);
  font-family: inherit;
  font-size: calc(13px * var(--pt-text-scale));
  font-weight: 600;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rail__bench:hover {
  background: var(--pt-card);
  color: var(--pt-ink);
}
.rail__foot {
  margin-top: auto;
  padding: 12px;
  font-size: calc(11px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
</style>
