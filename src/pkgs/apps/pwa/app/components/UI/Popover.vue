<script setup lang="ts">
import {
  PopoverArrow,
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
} from "reka-ui";

defineProps<{ align?: "start" | "center" | "end"; side?: "top" | "bottom" }>();
</script>

<template>
  <PopoverRoot>
    <PopoverTrigger as-child>
      <slot name="trigger" />
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent
        class="uipop"
        :align="align ?? 'start'"
        :side="side ?? 'bottom'"
        :side-offset="8"
      >
        <slot />
        <PopoverArrow class="uipop__arrow" />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

<style scoped>
.uipop {
  z-index: 40;
  min-width: 200px;
  max-width: 320px;
  background: var(--pt-card);
  border: 1.5px solid var(--pt-border-muted);
  border-radius: var(--pt-radius-md);
  box-shadow: 0 12px 28px rgba(44, 42, 39, 0.16);
  padding: 12px 14px;
}
.uipop__arrow {
  fill: var(--pt-card);
}
</style>
