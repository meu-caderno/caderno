<script setup lang="ts">
import type { Context, Link, Modules, Vocabulary } from "@meu-caderno/core";
import { AbsenceStance, Link as LinkEnum } from "@meu-caderno/core";

const props = defineProps<{ context: Context }>();
const emit = defineEmits<{ close: [] }>();

const { service } = useCadernoService();

const DEFAULT_VOCABULARY: Vocabulary = {
  subject: "disciplina",
  activity: "atividade",
  attendance: "presença",
  term: "período",
};

const draft = reactive({
  name: props.context.name,
  link: props.context.link as string,
  nature: props.context.nature ?? "",
  vision: props.context.vision ?? "",
  stance: props.context.absenceStance as string,
  floor: Math.round((props.context.attendanceFloor ?? 0.75) * 100),
  pinned: props.context.pinned ?? false,
  vocabulary: { ...DEFAULT_VOCABULARY, ...props.context.vocabulary },
  modules: { ...props.context.modules } as Modules,
});

const linkOptions = [
  { value: LinkEnum.PERSONAL, label: "🧭 Pessoal", desc: "Só você." },
  { value: LinkEnum.CLASS, label: "🏫 Turma", desc: "De uma disciplina." },
  { value: LinkEnum.GROUP, label: "👥 Grupo", desc: "Dividem várias." },
];
const stanceOptions = [
  { value: AbsenceStance.FOCUS_ON_NOT_MISSING, label: "🎯 Foco em não faltar" },
  { value: AbsenceStance.PLAN_ABSENCES, label: "🗓 Planejar faltas" },
];

const confirmingArchive = ref(false);

async function save() {
  await service.updateContext({
    ...props.context,
    name: draft.name.trim() || props.context.name,
    link: draft.link as Link,
    nature: draft.nature.trim() || undefined,
    vision: draft.vision.trim() || undefined,
    absenceStance: draft.stance as AbsenceStance,
    attendanceFloor: draft.floor / 100,
    pinned: draft.pinned,
    vocabulary: draft.vocabulary,
    modules: draft.modules,
  });
  emit("close");
}

async function archive() {
  await service.updateContext({ ...props.context, archived: true });
  emit("close");
}
</script>

<template>
  <UIModal title="Contexto" :subtitle="context.name" @close="emit('close')">
    <div class="context-detail">
      <UIField label="Nome">
        <input v-model="draft.name" class="context-detail__input" type="text" />
      </UIField>

      <UIField label="Tipo">
        <UIRadioGroup v-model="draft.link" :options="linkOptions" />
      </UIField>

      <UIField label="Natureza" hint="Opcional.">
        <input
          v-model="draft.nature"
          class="context-detail__input"
          type="text"
          placeholder="Ex.: ensino médio integrado"
        />
      </UIField>

      <UIField label="✨ Sua visão" hint="Um lembrete de por que você começou.">
        <textarea
          v-model="draft.vision"
          class="context-detail__input context-detail__textarea"
          rows="2"
          placeholder="Deixe em branco se não quiser."
        />
      </UIField>

      <UIField label="Postura com faltas">
        <UIRadioGroup v-model="draft.stance" :options="stanceOptions" />
      </UIField>

      <UIField label="Piso de frequência">
        <div class="context-detail__floor">
          <UINumberField v-model="draft.floor" :min="1" :max="100" />
          <span class="context-detail__pct">%</span>
        </div>
      </UIField>

      <UIField label="Vocabulário" hint="Como este contexto chama suas coisas.">
        <div class="context-detail__vocab">
          <input
            v-model="draft.vocabulary.subject"
            class="context-detail__input"
            placeholder="disciplina"
          />
          <input
            v-model="draft.vocabulary.activity"
            class="context-detail__input"
            placeholder="atividade"
          />
          <input
            v-model="draft.vocabulary.attendance"
            class="context-detail__input"
            placeholder="presença"
          />
          <input
            v-model="draft.vocabulary.term"
            class="context-detail__input"
            placeholder="período"
          />
        </div>
      </UIField>

      <UIField label="Módulos" hint="O que este contexto controla.">
        <SectionHomeContextModules v-model="draft.modules" />
      </UIField>

      <UISwitch
        v-model="draft.pinned"
        label="Fixar contexto"
        hint="Mantém este contexto no topo."
      />

      <div class="context-detail__actions">
        <UIButton
          variant="fantasma"
          icon="trash"
          label="Arquivar"
          @click="confirmingArchive = true"
        />
        <UIButton
          variant="primal"
          icon="check"
          label="Salvar"
          @click="save"
        />
      </div>
    </div>

    <UIConfirm
      v-if="confirmingArchive"
      title="Arquivar contexto?"
      description="Ele some da lista ativa e fica somente-leitura. Dá pra desarquivar depois."
      confirm-label="Arquivar"
      danger
      @confirm="archive"
      @cancel="confirmingArchive = false"
    />
  </UIModal>
</template>

<style scoped>
.context-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.context-detail__input {
  font-family: inherit;
  font-size: calc(15px * var(--pt-text-scale));
  padding: 10px 12px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink);
  width: 100%;
}
.context-detail__input:focus {
  outline: none;
  border-color: var(--pt-ink);
}
.context-detail__textarea {
  resize: vertical;
  line-height: 1.5;
}
.context-detail__floor {
  display: flex;
  align-items: center;
  gap: 8px;
}
.context-detail__pct {
  font-size: calc(15px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
.context-detail__vocab {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.context-detail__actions {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 6px;
}
</style>
