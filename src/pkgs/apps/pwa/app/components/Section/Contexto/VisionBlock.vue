<script setup lang="ts">
defineProps<{ vision: string }>();
</script>

<template>
  <section class="block vision-block">
    <div class="block__head">
      <h2 class="pt-hand block__title">✨ Sua visão</h2>
    </div>
    <p class="vision-block__text">{{ vision }}</p>
  </section>
</template>

<style scoped>
.vision-block__text {
  margin: 0;
  font-size: calc(15px * var(--pt-text-scale));
  line-height: 1.55;
  color: var(--pt-ink);
  white-space: pre-line;
}
</style>
