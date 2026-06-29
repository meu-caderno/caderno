<script setup lang="ts">
const head = useLocaleHead();

useHead({
  htmlAttrs: {
    lang: head.value.htmlAttrs?.lang,
  },
  link: head.value.link,
  meta: head.value.meta,
  titleTemplate: (t) => (t ? `${t} · Meu Caderno` : "Meu Caderno"),
});

const { hydrate: hydrateAppearance } = useAppearance();
onMounted(hydrateAppearance);
</script>

<template>
  <div>
    <NuxtPwaManifest />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UIToaster />
  </div>
</template>
