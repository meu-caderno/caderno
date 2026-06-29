<template>
  <div class="ajustes">
    <header class="ajustes__head">
      <h1 class="pt-hand ajustes__title">Ajustes</h1>
      <p class="ajustes__sub">Dados deste aparelho</p>
    </header>
    <SectionSettingsMoodsCard />
    <SectionSettingsGeneralCard />
    <SectionSettingsBackupCard />
  </div>
</template>

<style scoped>
.ajustes {
  max-width: 720px;
  margin: 0 auto;
  padding: 22px 16px 64px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.ajustes__title {
  font-size: 26px;
  font-weight: 800;
  margin: 0;
}
.ajustes__sub {
  font-size: 13px;
  color: var(--pt-ink-muted);
  margin: 4px 0 0;
}
</style>
