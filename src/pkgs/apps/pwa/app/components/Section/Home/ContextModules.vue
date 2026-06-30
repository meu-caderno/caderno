<script setup lang="ts">
import type { Modules } from "@meu-caderno/core";

const modules = defineModel<Modules>({ required: true });

const items: { key: keyof Modules; label: string; hint: string }[] = [
  {
    key: "attendance",
    label: "Faltas & presença",
    hint: "Chamada, simulador, risco.",
  },
  { key: "grades", label: "Notas & média", hint: "Avaliações com peso." },
  { key: "term", label: "Período", hint: "Semestre / termo." },
  { key: "streak", label: "Ofensiva (streak)", hint: "Sequência de dias." },
  { key: "hours", label: "Horas estudadas", hint: "Pomodoro / metas de hora." },
  {
    key: "syllabus",
    label: "Conteúdo / edital",
    hint: "Cobertura do programa.",
  },
  { key: "certificate", label: "Certificado", hint: "Curso livre." },
];
</script>

<template>
  <div class="context-modules">
    <div v-for="item in items" :key="item.key" class="context-modules__row">
      <UISwitch
        v-model="modules[item.key]"
        :label="item.label"
        :hint="item.hint"
      />
    </div>
  </div>
</template>

<style scoped>
.context-modules {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.context-modules__row {
  padding: 8px 0;
  border-bottom: 1.5px dashed var(--pt-border-faint);
}
.context-modules__row:last-child {
  border-bottom: none;
}
</style>
