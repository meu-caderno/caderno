<script setup lang="ts">
import type { Bucket, Context, Id } from "@meu-caderno/core";

const props = defineProps<{ context: Context }>();
const emit = defineEmits<{ done: []; cancel: [] }>();

const { service, ids } = useCadernoService();

const INTEGRALIZATION_TEMPLATE = [
  { name: "Obrigatórias", goal: 100, unit: "créditos" },
  { name: "Optativas", goal: 20, unit: "créditos" },
  { name: "Estágio", goal: 1, unit: "etapa" },
  { name: "Horas complementares", goal: 200, unit: "h" },
  { name: "TCC", goal: 1, unit: "etapa" },
];

const buckets = ref<Bucket[]>(
  (props.context.buckets ?? []).map((bucket) => ({ ...bucket })),
);
const saving = ref(false);

async function addBucket() {
  buckets.value.push({
    id: await ids.newId(),
    name: "",
    done: 0,
    goal: 0,
  });
}

async function applyTemplate() {
  const created: Bucket[] = [];
  for (const item of INTEGRALIZATION_TEMPLATE) {
    created.push({
      id: await ids.newId(),
      name: item.name,
      done: 0,
      goal: item.goal,
      unit: item.unit,
    });
  }
  buckets.value = created;
}

function removeBucket(id: Id) {
  buckets.value = buckets.value.filter((bucket) => bucket.id !== id);
}

async function save() {
  if (saving.value) return;
  saving.value = true;
  const cleaned = buckets.value
    .filter((bucket) => bucket.name.trim())
    .map((bucket) => ({ ...bucket, name: bucket.name.trim() }));
  const res = await service.updateContext({
    ...props.context,
    buckets: cleaned.length ? cleaned : undefined,
  });
  saving.value = false;
  if (res.ok) emit("done");
}
</script>

<template>
  <UIModal
    title="Metas & integralização"
    subtitle="baldes com meta e progresso"
    @close="emit('cancel')"
  >
    <div class="goals-manager">
      <div v-if="!buckets.length" class="goals-manager__empty">
        Sem metas ainda. Crie baldes ou use o modelo de integralização.
      </div>

      <div
        v-for="bucket in buckets"
        :key="bucket.id"
        class="goals-manager__row"
      >
        <input
          v-model="bucket.name"
          class="goals-manager__input goals-manager__name"
          type="text"
          placeholder="Nome do balde"
        />
        <div class="goals-manager__nums">
          <input
            v-model.number="bucket.done"
            class="goals-manager__input goals-manager__num"
            type="number"
            min="0"
            aria-label="Feito"
          />
          <span class="goals-manager__slash">/</span>
          <input
            v-model.number="bucket.goal"
            class="goals-manager__input goals-manager__num"
            type="number"
            min="0"
            aria-label="Meta"
          />
          <input
            v-model="bucket.unit"
            class="goals-manager__input goals-manager__unit"
            type="text"
            placeholder="un."
          />
          <button
            type="button"
            class="goals-manager__x"
            aria-label="Remover balde"
            @click="removeBucket(bucket.id)"
          >
            <UIIcon icon="x" :size="14" />
          </button>
        </div>
      </div>

      <div class="goals-manager__tools">
        <UIButton
          variant="fantasma"
          icon="plus"
          label="Balde"
          @click="addBucket"
        />
        <UIButton
          variant="fantasma"
          icon="list"
          label="Modelo integralização"
          @click="applyTemplate"
        />
      </div>

      <div class="goals-manager__actions">
        <UIButton variant="fantasma" label="Cancelar" @click="emit('cancel')" />
        <UIButton
          variant="primal"
          icon="check"
          :label="saving ? 'Salvando…' : 'Salvar metas'"
          @click="save"
        />
      </div>
    </div>
  </UIModal>
</template>

<style scoped>
.goals-manager {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.goals-manager__empty {
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
.goals-manager__row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.goals-manager__input {
  font-family: inherit;
  font-size: calc(14px * var(--pt-text-scale));
  padding: 9px 11px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink);
}
.goals-manager__input:focus {
  outline: none;
  border-color: var(--pt-accent);
}
.goals-manager__name {
  width: 100%;
}
.goals-manager__nums {
  display: flex;
  align-items: center;
  gap: 6px;
}
.goals-manager__num {
  width: 64px;
}
.goals-manager__unit {
  flex: 1;
  min-width: 0;
}
.goals-manager__slash {
  color: var(--pt-ink-muted);
}
.goals-manager__x {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: var(--pt-radius-sm);
  border: none;
  background: var(--pt-paper-2);
  color: var(--pt-ink-muted);
  cursor: pointer;
}
.goals-manager__tools {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.goals-manager__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}
</style>
