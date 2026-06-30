<script setup lang="ts">
const emit = defineEmits<{ close: [] }>();

const { search } = useSearch();
const query = ref("");
const hits = computed(() => search(query.value));
const active = ref(0);
const inputEl = ref<HTMLInputElement | null>(null);

watch(hits, () => {
  active.value = 0;
});
onMounted(() => inputEl.value?.focus());

function go(to: string) {
  emit("close");
  void navigateTo(to);
}
function onEnter() {
  const hit = hits.value[active.value];
  if (hit) go(hit.to);
}
function move(delta: number) {
  const count = hits.value.length;
  if (!count) return;
  active.value = (active.value + delta + count) % count;
}
</script>

<template>
  <div class="palette" @click.self="emit('close')">
    <div class="palette__panel" role="dialog" aria-label="Buscar">
      <div class="palette__search">
        <UIIcon icon="search" :size="18" />
        <input
          ref="inputEl"
          v-model="query"
          class="palette__input"
          type="text"
          placeholder="Buscar contextos, disciplinas, atividades, notas…"
          @keydown.down.prevent="move(1)"
          @keydown.up.prevent="move(-1)"
          @keydown.enter.prevent="onEnter"
          @keydown.esc="emit('close')"
        />
        <kbd class="palette__kbd">esc</kbd>
      </div>
      <div v-if="query && !hits.length" class="palette__empty">
        Nada encontrado para “{{ query }}”.
      </div>
      <ul v-else-if="hits.length" class="palette__list">
        <li
          v-for="(hit, index) in hits"
          :key="`${hit.kind}-${hit.id}`"
          class="palette__row"
          :class="{ 'palette__row--active': index === active }"
          @mouseenter="active = index"
          @click="go(hit.to)"
        >
          <span class="palette__kind">{{ hit.kind }}</span>
          <span class="palette__label">{{ hit.label }}</span>
        </li>
      </ul>
      <div v-else class="palette__hint">
        Digite para buscar em todo o caderno.
      </div>
    </div>
  </div>
</template>

<style scoped>
.palette {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 14vh 16px 16px;
  background: rgba(var(--pt-ink-rgb), 0.42);
}
.palette__panel {
  width: 100%;
  max-width: 540px;
  background: var(--pt-card);
  border: 2px solid var(--pt-border);
  border-radius: var(--pt-radius-lg);
  box-shadow: var(--pt-shadow-strong);
  overflow: hidden;
}
.palette__search {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 12px 14px;
  border-bottom: 1.5px solid var(--pt-border-faint);
  color: var(--pt-ink-muted);
}
.palette__input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: calc(15px * var(--pt-text-scale));
  color: var(--pt-ink);
}
.palette__kbd {
  font-size: 11px;
  font-weight: 700;
  color: var(--pt-ink-faint);
  border: 1.5px solid var(--pt-border-faint);
  border-radius: 5px;
  padding: 1px 5px;
}
.palette__list {
  list-style: none;
  margin: 0;
  padding: 6px;
  max-height: 50vh;
  overflow-y: auto;
}
.palette__row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: var(--pt-radius-sm);
  cursor: pointer;
}
.palette__row--active {
  background: var(--pt-linen);
}
.palette__kind {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--pt-ink-muted);
  background: var(--pt-paper-2);
  border-radius: var(--pt-radius-pill);
  padding: 2px 8px;
}
.palette__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: calc(14px * var(--pt-text-scale));
}
.palette__empty,
.palette__hint {
  padding: 18px 16px;
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
</style>
