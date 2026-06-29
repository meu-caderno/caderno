<template>
  <div class="shell">
    <SectionShellRail class="shell__rail" />
    <main class="shell__content">
      <slot />
    </main>
    <SectionShellTabBar class="shell__tabbar" />
  </div>
</template>

<style scoped>
/* Mobile-first: single column, bottom tab bar */
.shell {
  min-height: 100vh;
}
.shell__rail {
  display: none;
}
.shell__content {
  min-width: 0;
  padding-bottom: 72px;
}

/* Desktop: fixed rail on the left, no tab bar */
@media (min-width: 960px) {
  .shell {
    display: grid;
    grid-template-columns: 224px 1fr;
    align-items: start;
  }
  .shell__rail {
    display: flex;
    position: sticky;
    top: 0;
  }
  .shell__content {
    padding-bottom: 0;
  }
  .shell__tabbar {
    display: none;
  }
}
</style>
