<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    accent?: string;
    pad?: string;
    radius?: string;
    bg?: string;
    flat?: boolean;
  }>(),
  { pad: "16px", radius: "16px", bg: "var(--pt-card)", flat: false },
);

const style = computed(() => ({
  background: props.bg,
  borderRadius: props.radius,
  padding: props.pad,
  ...(props.accent ? { borderLeft: `6px solid ${props.accent}` } : {}),
  ...(props.flat ? {} : { boxShadow: "var(--pt-shadow)" }),
}));
</script>

<template>
  <div class="pt-card" :style="style"><slot /></div>
</template>

<style scoped>
.pt-card {
  border: var(--pt-stroke) solid var(--pt-border);
  box-sizing: border-box;
}
</style>
