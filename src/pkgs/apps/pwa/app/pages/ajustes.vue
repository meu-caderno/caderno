<template>
  <div class="ajustes">
    <header class="ajustes__head">
      <h1 class="pt-hand ajustes__title">Ajustes</h1>
      <p class="ajustes__sub">Dados deste aparelho</p>
    </header>
    <SectionSettingsMoodsCard />
    <SectionSettingsDisplayCard />
    <SectionSettingsTypographyCard />
    <SectionSettingsLayoutCard />
    <SectionSettingsContextProfileCard />
    <SectionSettingsPomodoroCard />
    <SectionSettingsWorkbenchesCard />
    <SectionSettingsConsentCard />
    <SectionSettingsGeneralCard />
    <SectionSettingsBackupCard />
  </div>
</template>

<style scoped>
.ajustes {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--pt-pad-screen) 16px 64px;
  display: flex;
  flex-direction: column;
  gap: calc(22px * var(--pt-density));
}
.ajustes__title {
  font-size: calc(26px * var(--pt-text-scale));
  font-weight: 800;
  margin: 0;
}
.ajustes__sub {
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  margin: 4px 0 0;
}
</style>
