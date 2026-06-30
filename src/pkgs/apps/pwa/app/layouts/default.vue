<script setup lang="ts">
import { SplitterGroup, SplitterPanel, SplitterResizeHandle } from "reka-ui";
import { useTheme } from "~/composables/useTheme";

const { zen, setZen } = useTheme();
const { focusing, close: closeFocus } = useFocus();

const searching = ref(false);
const dockOpen = useState("shell:dock", () => false);
const isWide = useMediaQuery("(min-width: 1100px)");
const showSplit = computed(() => isWide.value && dockOpen.value && !zen.value);

function onKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searching.value = !searching.value;
  }
}
onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
  <div class="shell" :class="{ 'shell--zen': zen, 'shell--split': showSplit }">
    <SectionShellRail v-if="!zen" class="shell__rail" />
    <div class="shell__area">
      <SplitterGroup
        v-if="showSplit"
        direction="horizontal"
        class="shell__split"
      >
        <SplitterPanel
          :default-size="66"
          :min-size="42"
          class="shell__pane shell__pane--scroll"
        >
          <main class="shell__content">
            <slot />
          </main>
        </SplitterPanel>
        <SplitterResizeHandle class="shell__handle" />
        <SplitterPanel
          :default-size="34"
          :min-size="22"
          :max-size="48"
          class="shell__pane"
        >
          <SectionShellNotesPanel @close="dockOpen = false" />
        </SplitterPanel>
      </SplitterGroup>
      <main v-else class="shell__content">
        <slot />
      </main>
    </div>
    <SectionShellTabBar v-if="!zen" class="shell__tabbar" />
    <button
      v-if="zen"
      type="button"
      class="shell__exit-zen"
      @click="setZen(false)"
    >
      <UIIcon icon="x" :size="16" /> sair do foco
    </button>
    <SectionHomePomodoroOverlay v-if="focusing" @close="closeFocus" />
    <UICommandPalette v-if="searching" @close="searching = false" />
  </div>
</template>

<style scoped>
.shell {
  min-height: 100vh;
}
.shell__rail {
  display: none;
}
.shell__area {
  min-width: 0;
}
.shell__content {
  min-width: 0;
  padding-bottom: 72px;
}
.shell__split {
  height: 100vh;
  width: 100%;
}
.shell__pane {
  height: 100%;
  min-width: 0;
}
.shell__pane--scroll {
  overflow-y: auto;
}
.shell__handle {
  width: 6px;
  flex-shrink: 0;
  background: var(--pt-border-faint);
  cursor: col-resize;
}
.shell__handle:hover {
  background: var(--pt-border-muted);
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
  .shell--split .shell__area {
    height: 100vh;
    overflow: hidden;
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
