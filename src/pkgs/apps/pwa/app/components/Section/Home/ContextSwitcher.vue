<script setup lang="ts">
import type { Context, Id } from "@meu-caderno/core";
import { Goal } from "@meu-caderno/core";

const props = defineProps<{ contexts: Context[]; active: Context | null }>();
const emit = defineEmits<{ select: [id: Id]; create: [] }>();

const goalIcon: Record<Goal, string> = {
  [Goal.UNIVERSITY]: "🎓",
  [Goal.PUBLIC_EXAM]: "📚",
  [Goal.OPEN_COURSE]: "🧩",
  [Goal.FREE_STUDY]: "🌱",
  [Goal.NONE]: "📔",
};

const items = computed(() => [
  ...props.contexts.map((context) => ({
    value: context.id as string,
    label: `${goalIcon[context.goal]}  ${context.name}`,
    icon: context.id === props.active?.id ? ("check" as const) : undefined,
  })),
  {
    value: "__new",
    label: "Novo contexto",
    icon: "plus" as const,
    separatorBefore: true,
  },
]);

function onSelect(value: string) {
  if (value === "__new") emit("create");
  else emit("select", value as Id);
}
</script>

<template>
  <UIMenu :items="items" align="start" @select="onSelect">
    <template #trigger>
      <button class="cs__trigger" type="button">
        <span class="cs__icon">{{ goalIcon[active?.goal ?? Goal.NONE] }}</span>
        <span class="cs__name pt-hand">{{ active?.name ?? "Contexto" }}</span>
        <UIIcon icon="chevron-down" :size="16" />
      </button>
    </template>
  </UIMenu>
</template>

<style scoped>
.cs__trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--pt-ink);
  font-family: inherit;
}
.cs__icon {
  font-size: calc(26px * var(--pt-text-scale));
  line-height: 1;
}
.cs__name {
  font-size: calc(26px * var(--pt-text-scale));
  font-weight: 700;
  line-height: 1.05;
}
</style>
