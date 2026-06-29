<script setup lang="ts">
import {
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from "reka-ui";

defineProps<{ text: string }>();
</script>

<template>
  <TooltipProvider :delay-duration="200">
    <TooltipRoot>
      <TooltipTrigger as-child>
        <slot />
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent class="uitt" :side-offset="6">
          {{ text }}
          <TooltipArrow class="uitt__arrow" />
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>

<style scoped>
.uitt {
  z-index: 60;
  max-width: 240px;
  font-size: calc(12px * var(--pt-text-scale));
  font-weight: 500;
  line-height: 1.4;
  color: var(--pt-paper);
  background: var(--pt-ink);
  padding: 7px 10px;
  border-radius: var(--pt-radius-sm);
  box-shadow: 0 6px 18px rgba(44, 42, 39, 0.24);
}
.uitt__arrow {
  fill: var(--pt-ink);
}
</style>
