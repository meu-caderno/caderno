<script setup lang="ts">
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "reka-ui";
import type { IconName } from "./Icon.vue";

interface MenuItem {
  value: string;
  label: string;
  icon?: IconName;
  danger?: boolean;
  separatorBefore?: boolean;
}

defineProps<{ items: MenuItem[]; align?: "start" | "end" }>();
const emit = defineEmits<{ select: [value: string] }>();
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger as-child>
      <slot name="trigger" />
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent
        class="uimenu"
        :align="align ?? 'end'"
        :side-offset="6"
      >
        <template v-for="it in items" :key="it.value">
          <DropdownMenuSeparator v-if="it.separatorBefore" class="uimenu__sep" />
          <DropdownMenuItem
            class="uimenu__item"
            :class="{ 'uimenu__item--danger': it.danger }"
            @select="emit('select', it.value)"
          >
            <UIIcon v-if="it.icon" :icon="it.icon" :size="15" />
            {{ it.label }}
          </DropdownMenuItem>
        </template>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>

<style scoped>
.uimenu {
  z-index: 40;
  min-width: 200px;
  background: var(--pt-card);
  border: 1.5px solid var(--pt-border-muted);
  border-radius: var(--pt-radius-md);
  box-shadow: 0 12px 28px rgba(44, 42, 39, 0.16);
  padding: 6px;
}
.uimenu__item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
  padding: 9px 10px;
  border-radius: var(--pt-radius-sm);
  color: var(--pt-ink-soft);
  cursor: pointer;
  outline: none;
}
.uimenu__item[data-highlighted] {
  background: var(--pt-paper);
  color: var(--pt-ink);
}
.uimenu__item--danger {
  color: var(--pt-danger);
}
.uimenu__sep {
  height: 1.5px;
  background: var(--pt-border-faint);
  margin: 5px 0;
}
</style>
