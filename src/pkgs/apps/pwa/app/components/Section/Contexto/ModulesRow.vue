<script setup lang="ts">
import type { Modules } from "@meu-caderno/core";

const props = defineProps<{ modules: Modules }>();

const MODULE_LABELS: Record<keyof Modules, string> = {
  attendance: "🗓 Faltas & presença",
  grades: "📊 Notas & média",
  term: "📆 Período",
  streak: "🔥 Ofensiva",
  hours: "⏱ Horas estudadas",
  syllabus: "📖 Conteúdo / edital",
  certificate: "🏅 Certificado",
};

const activeModules = computed(() =>
  (Object.keys(MODULE_LABELS) as (keyof Modules)[])
    .filter((key) => props.modules[key])
    .map((key) => MODULE_LABELS[key]),
);
</script>

<template>
  <section class="block modules-row">
    <div class="block__head">
      <h2 class="pt-hand block__title">Módulos ativos</h2>
      <span class="block__count">{{ activeModules.length }}</span>
    </div>

    <div v-if="activeModules.length" class="modules-row__chips">
      <UIBadge
        v-for="label in activeModules"
        :key="label"
        tone="info"
        size="md"
        :label="label"
      />
    </div>
    <p v-else class="modules-row__empty">
      Nenhum módulo ativo. Ative-os em “Configurar”.
    </p>
  </section>
</template>

<style scoped>
.modules-row__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.modules-row__empty {
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  margin: 0;
}
</style>
