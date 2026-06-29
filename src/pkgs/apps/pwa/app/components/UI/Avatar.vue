<script setup lang="ts">
import { AvatarFallback, AvatarImage, AvatarRoot } from "reka-ui";

defineProps<{ src?: string; fallback: string; size?: number }>();
</script>

<template>
  <AvatarRoot
    class="uiav"
    :style="{ width: `${size ?? 34}px`, height: `${size ?? 34}px` }"
  >
    <AvatarImage v-if="src" :src="src" class="uiav__img" />
    <AvatarFallback class="uiav__fb">{{ fallback }}</AvatarFallback>
  </AvatarRoot>
</template>

<style scoped>
.uiav {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  background: var(--pt-card);
  border: 1.5px solid var(--pt-border-muted);
  flex-shrink: 0;
}
.uiav__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.uiav__fb {
  font-size: 13px;
  font-weight: 700;
  color: var(--pt-ink-soft);
  text-transform: uppercase;
}
</style>
