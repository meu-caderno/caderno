<script setup lang="ts">
type AgendaView = "lista" | "dia" | "semana" | "mes";

interface ViewOption {
  id: AgendaView;
  label: string;
  icon: string;
  subtitle: string;
}

const VIEWS: ViewOption[] = [
  { id: "lista", label: "Lista", icon: "≣", subtitle: "Próximos 7 dias" },
  { id: "dia", label: "Dia", icon: "▦", subtitle: "Um dia por vez" },
  { id: "semana", label: "Semana", icon: "▤", subtitle: "A semana inteira" },
  { id: "mes", label: "Mês", icon: "▥", subtitle: "Visão do mês" },
];

const { days, booting, ready } = useAgenda();
const view = ref<AgendaView>("lista");
const subtitle = computed(
  () => VIEWS.find((option) => option.id === view.value)?.subtitle ?? "",
);
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
    <SectionPageHeader title="Agenda" :subtitle="subtitle" />

    <nav class="agenda__tabs">
      <UIChip
        v-for="option in VIEWS"
        :key="option.id"
        :icon="option.icon"
        :label="option.label"
        :selected="view === option.id"
        @click="view = option.id"
      />
    </nav>

    <template v-if="view === 'lista'">
      <SectionAgendaDayRow v-for="day in days" :key="day.day" :day="day" />
    </template>
    <SectionAgendaDayView v-else-if="view === 'dia'" />
    <SectionAgendaWeekView v-else-if="view === 'semana'" />
    <SectionAgendaMonthGrid v-else />
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
.agenda__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
