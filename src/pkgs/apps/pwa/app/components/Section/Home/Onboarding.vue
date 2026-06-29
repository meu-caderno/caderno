<script setup lang="ts">
import { AbsenceStance, Goal, Link } from "@meu-caderno/core";

defineProps<{ cancelable?: boolean }>();
const emit = defineEmits<{ cancel: []; done: [] }>();

const { service } = useCadernoService();
const { setActive } = useActiveContext();

const goals: { value: Goal; icon: string; label: string }[] = [
  { value: Goal.UNIVERSITY, icon: "🎓", label: "Faculdade" },
  { value: Goal.PUBLIC_EXAM, icon: "📚", label: "Concurso" },
  { value: Goal.OPEN_COURSE, icon: "🧩", label: "Curso" },
  { value: Goal.FREE_STUDY, icon: "🌱", label: "Estudo livre" },
];

const name = ref("");
const goal = ref<Goal>(Goal.UNIVERSITY);
const creating = ref(false);

async function create() {
  const trimmed = name.value.trim();
  if (!trimmed || creating.value) return;
  creating.value = true;
  const res = await service.createContext({
    name: trimmed,
    goal: goal.value,
    link: Link.PERSONAL,
    absenceStance: AbsenceStance.PLAN_ABSENCES,
    modules: {
      attendance: true,
      grades: true,
      term: false,
      streak: false,
      hours: false,
      syllabus: false,
      certificate: false,
    },
  });
  creating.value = false;
  if (res.ok) {
    await setActive(res.value.id);
    emit("done");
  }
}
</script>

<template>
  <div class="onb">
    <button
      v-if="cancelable"
      type="button"
      class="onb__back"
      @click="emit('cancel')"
    >
      <UIIcon icon="chevron-left" :size="15" /> voltar
    </button>
    <div class="onb__hero">
      <div class="onb__mark">📔</div>
      <h1 class="pt-hand onb__title">Seu caderno começa aqui</h1>
      <p class="onb__sub">
        Crie um contexto de estudo — uma faculdade, um concurso, um curso. Tudo
        fica neste aparelho.
      </p>
    </div>

    <UICard radius="18px" pad="20px" class="onb__card">
      <label class="onb__label" for="onb-name">
        Como você chama esse contexto?
      </label>
      <input
        id="onb-name"
        v-model="name"
        class="onb__input"
        type="text"
        placeholder="Ex.: Faculdade, ENEM, Inglês…"
        @keyup.enter="create"
      />

      <div class="onb__goals">
        <button
          v-for="goalOption in goals"
          :key="goalOption.value"
          type="button"
          class="onb__goal"
          :class="{ 'onb__goal--on': goal === goalOption.value }"
          @click="goal = goalOption.value"
        >
          <span class="onb__goal-icon">{{ goalOption.icon }}</span>{{ goalOption.label }}
        </button>
      </div>

      <UIButton
        variant="primal"
        full
        icon="check"
        :label="creating ? 'Criando…' : 'Criar contexto'"
        @click="create"
      />
    </UICard>
  </div>
</template>

<style scoped>
.onb {
  max-width: 480px;
  margin: 0 auto;
  padding: 48px 16px 64px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.onb__back {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  font-family: inherit;
  font-size: calc(13px * var(--pt-text-scale));
  font-weight: 600;
  color: var(--pt-ink-muted);
  cursor: pointer;
  padding: 0;
}
.onb__hero {
  text-align: center;
}
.onb__mark {
  font-size: calc(44px * var(--pt-text-scale));
  line-height: 1;
}
.onb__title {
  font-size: calc(30px * var(--pt-text-scale));
  font-weight: 700;
  margin: 12px 0 6px;
}
.onb__sub {
  font-size: calc(14px * var(--pt-text-scale));
  line-height: 1.5;
  color: var(--pt-ink-muted);
  margin: 0;
}
.onb__card {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.onb__label {
  font-size: calc(14px * var(--pt-text-scale));
  font-weight: 600;
}
.onb__input {
  font-family: inherit;
  font-size: calc(16px * var(--pt-text-scale));
  padding: 12px 14px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-paper);
  color: var(--pt-ink);
  width: 100%;
}
.onb__input:focus {
  outline: none;
  border-color: var(--pt-ink);
}
.onb__goals {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.onb__goal {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: inherit;
  font-size: calc(13px * var(--pt-text-scale));
  font-weight: 600;
  padding: 10px 12px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink-soft);
  cursor: pointer;
}
.onb__goal--on {
  border-color: var(--pt-ink);
  color: var(--pt-ink);
  background: var(--pt-paper);
}
.onb__goal-icon {
  font-size: calc(16px * var(--pt-text-scale));
}
</style>
