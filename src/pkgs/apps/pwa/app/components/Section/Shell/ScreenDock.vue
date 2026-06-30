<script setup lang="ts">
const props = defineProps<{ path: string }>();
const emit = defineEmits<{ close: []; pick: [path: string] }>();

const router = useRouter();
const resolved = computed(() => router.resolve(props.path));

const DOCK_OPTIONS = [
  { value: "/caderno", label: "Caderno" },
  { value: "/disciplinas", label: "Disciplinas" },
  { value: "/presencas", label: "Presenças" },
  { value: "/atividades", label: "Atividades" },
  { value: "/agenda", label: "Agenda" },
  { value: "/acervo", label: "Acervo" },
];

function onPick(value: string | undefined) {
  if (value) emit("pick", value);
}
</script>

<template>
  <aside class="dock">
    <div class="dock__head">
      <UISelect
        :model-value="path"
        :options="DOCK_OPTIONS"
        @update:model-value="onPick"
      />
      <button
        type="button"
        class="dock__close"
        aria-label="Fechar painel"
        @click="emit('close')"
      >
        <UIIcon icon="x" :size="16" />
      </button>
    </div>
    <div class="dock__body">
      <RouterView :route="resolved" />
    </div>
  </aside>
</template>

<style scoped>
.dock {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--pt-paper-2);
  border-left: 2px solid var(--pt-border);
  overflow: hidden;
}
.dock__head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-bottom: 1.5px solid var(--pt-border-faint);
}
.dock__head :deep(> *:first-child) {
  flex: 1;
  min-width: 0;
}
.dock__close {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: var(--pt-radius-sm);
  background: transparent;
  color: var(--pt-ink-muted);
  cursor: pointer;
}
.dock__close:hover {
  background: var(--pt-linen);
}
.dock__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
</style>
