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
    <header class="agenda__head">
      <h1 class="pt-hand agenda__title">Agenda</h1>
      <p class="agenda__sub">Próximos 7 dias</p>
    </header>
    <SectionAgendaDayRow v-for="day in days" :key="day.day" :day="day" />
  </div>
</template>

<style scoped>
.agenda {
  max-width: 720px;
  margin: 0 auto;
  padding: 22px 16px 64px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.agenda--center {
  padding: 64px 16px;
  text-align: center;
  color: var(--pt-ink-muted);
}
.agenda__title {
  font-size: 26px;
  font-weight: 800;
  margin: 0;
}
.agenda__sub {
  font-size: 13px;
  color: var(--pt-ink-muted);
  margin: 4px 0 8px;
}
</style>
