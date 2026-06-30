<script setup lang="ts">
defineOptions({ name: "UIIcon" });

export type IconName =
  | "chevron-right"
  | "chevron-down"
  | "chevron-up"
  | "chevron-left"
  | "plus"
  | "minus"
  | "search"
  | "settings"
  | "x"
  | "check"
  | "lock"
  | "download"
  | "arrow-up"
  | "arrow-down"
  | "more-horizontal"
  | "pencil"
  | "trash"
  | "filter"
  | "rotate-ccw"
  | "calendar"
  | "list"
  | "link";

const props = withDefaults(
  defineProps<{
    icon: IconName;
    size?: number;
  }>(),
  { size: 18 },
);
</script>

<template>
  <Icon
    :name="`lucide:${props.icon}`"
    class="pt-icon"
    :style="{ fontSize: `${size}px`, width: `${size}px`, height: `${size}px` }"
  />
</template>

<style scoped>
.pt-icon {
  display: inline-flex;
  flex-shrink: 0;
  vertical-align: middle;
}
</style>
