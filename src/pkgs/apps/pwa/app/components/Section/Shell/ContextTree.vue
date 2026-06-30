<script setup lang="ts">
import type { Id, Subject } from "@meu-caderno/core";

const { contexts, effectiveId } = useActiveContext();
const { store } = useCadernoService();
const allSubjects = useLiveQuery(
  ["subjects"],
  () => store.subjects.list(),
  [] as Subject[],
);

const expanded = useState<Record<string, boolean>>(
  "shell:tree:expanded",
  () => ({}),
);
function toggle(id: Id) {
  expanded.value = { ...expanded.value, [id]: !expanded.value[id] };
}
function subjectsOf(contextId: Id): Subject[] {
  return allSubjects.value.filter((subject) => subject.contextId === contextId);
}
const GOAL_EMOJI: Record<string, string> = {
  UNIVERSITY: "🎓",
  PUBLIC_EXAM: "🏛️",
  OPEN_COURSE: "📖",
  FREE_STUDY: "🧭",
  NONE: "📁",
};
</script>

<template>
  <div v-if="contexts.length" class="ctx-tree">
    <span class="pt-eyebrow ctx-tree__title">Contextos</span>
    <div v-for="context in contexts" :key="context.id" class="ctx-tree__group">
      <div class="ctx-tree__row">
        <button
          type="button"
          class="ctx-tree__chev"
          :aria-label="expanded[context.id] ? 'Recolher' : 'Expandir'"
          @click="toggle(context.id)"
        >
          {{ expanded[context.id] ? "▾" : "▸" }}
        </button>
        <NuxtLink
          :to="`/contexto/${context.id}`"
          class="ctx-tree__ctx"
          :class="{ 'ctx-tree__ctx--active': context.id === effectiveId }"
        >
          <span>{{ GOAL_EMOJI[context.goal] ?? "📁" }}</span>
          <span class="ctx-tree__label">{{ context.name }}</span>
        </NuxtLink>
      </div>
      <div v-if="expanded[context.id]" class="ctx-tree__kids">
        <NuxtLink
          v-for="subject in subjectsOf(context.id)"
          :key="subject.id"
          to="/disciplinas"
          class="ctx-tree__kid"
        >
          <span
            class="ctx-tree__dot"
            :style="{ background: subject.color }"
          />
          <span class="ctx-tree__label">{{ subject.name }}</span>
        </NuxtLink>
        <span v-if="!subjectsOf(context.id).length" class="ctx-tree__empty">
          sem disciplinas
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ctx-tree {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 14px;
}
.ctx-tree__title {
  padding: 0 12px 2px;
}
.ctx-tree__row {
  display: flex;
  align-items: center;
}
.ctx-tree__chev {
  width: 20px;
  height: 28px;
  border: none;
  background: none;
  color: var(--pt-ink-faint);
  font-size: 10px;
  cursor: pointer;
  flex-shrink: 0;
}
.ctx-tree__ctx {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 8px;
  border-radius: var(--pt-radius-sm);
  text-decoration: none;
  color: var(--pt-ink-soft);
  font-size: calc(13px * var(--pt-text-scale));
  font-weight: 600;
}
.ctx-tree__ctx:hover {
  background: var(--pt-card);
}
.ctx-tree__ctx--active {
  color: var(--pt-ink);
}
.ctx-tree__kids {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding-left: 20px;
}
.ctx-tree__kid {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 8px;
  border-radius: var(--pt-radius-sm);
  text-decoration: none;
  color: var(--pt-ink-muted);
  font-size: calc(12px * var(--pt-text-scale));
}
.ctx-tree__kid:hover {
  background: var(--pt-card);
  color: var(--pt-ink-soft);
}
.ctx-tree__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.ctx-tree__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ctx-tree__empty {
  padding: 4px 8px;
  font-size: calc(11px * var(--pt-text-scale));
  color: var(--pt-ink-faint);
}
</style>
