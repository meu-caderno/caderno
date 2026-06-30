<script setup lang="ts">
const head = useLocaleHead();

useHead({
  htmlAttrs: {
    lang: head.value.htmlAttrs?.lang,
  },
  link: head.value.link,
  meta: head.value.meta,
  titleTemplate: (title) => (title ? `${title} · Meu Caderno` : "Meu Caderno"),
});

const { hydrate: hydrateTheme } = useTheme();
const { hydrate: hydrateLayout } = useLayout();
const { hydrate: hydrateConsent } = useConsent();
const { hydrate: hydrateWorkbenches } = useWorkbenches();
onMounted(() => {
  hydrateTheme();
  hydrateLayout();
  hydrateConsent();
  hydrateWorkbenches();
});
</script>

<template>
  <div>
    <!-- <NuxtPwaManifest /> -->
    <NuxtLayout>
      <NuxtPage keepalive />
    </NuxtLayout>
    <UIToaster />
  </div>
</template>
