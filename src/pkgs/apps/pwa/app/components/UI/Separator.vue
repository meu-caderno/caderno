<script setup lang="ts">
import { Separator } from "reka-ui";

defineProps<{ vertical?: boolean }>();
</script>

<template>
  <Separator
    :orientation="vertical ? 'vertical' : 'horizontal'"
    class="uisep"
    :class="{ 'uisep--v': vertical }"
  />
</template>

<style scoped>
.uisep {
  background: var(--pt-border-faint);
  border: none;
}
.uisep:not(.uisep--v) {
  height: 1.5px;
  width: 100%;
}
.uisep--v {
  width: 1.5px;
  align-self: stretch;
}
</style>
