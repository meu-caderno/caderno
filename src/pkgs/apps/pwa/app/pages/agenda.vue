<script setup lang="ts">
const { days, booting, ready } = useAgenda();
</script>

<template>
  <div v-if="booting" class="agenda agenda--center">carregando…</div>
  <div v-else-if="!ready" class="agenda agenda--center">
    <UIEmptyState
      icon="🗓️"
      title="Agenda"
      subtitle="Crie um contexto para ver suas aulas e entregas da semana."
    />
  </div>
  <div v-else class="agenda">
    <SectionPageHeader title="Agenda" subtitle="Próximos 7 dias" />
    <SectionAgendaDayRow v-for="day in days" :key="day.day" :day="day" />
  </div>
</template>

<style scoped>
.agenda {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--pt-pad-screen) 16px 64px;
  display: flex;
  flex-direction: column;
  gap: calc(12px * var(--pt-density));
}
.agenda--center {
  padding: 64px 16px;
  text-align: center;
  color: var(--pt-ink-muted);
}
</style>
