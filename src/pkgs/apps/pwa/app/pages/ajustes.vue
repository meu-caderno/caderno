<template>
  <div class="ajustes">
    <SectionPageHeader title="Ajustes" subtitle="Dados deste aparelho" />
    <SectionSettingsMoodsCard />
    <SectionSettingsDisplayCard />
    <SectionSettingsTypographyCard />
    <SectionSettingsLayoutCard />
    <SectionSettingsContextProfileCard />
    <SectionSettingsPomodoroCard />
    <SectionSettingsWorkbenchesCard />
    <SectionSettingsPluginsCard />
    <SectionSettingsOplogCard />
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
</style>
