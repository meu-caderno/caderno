<script setup lang="ts">
import { ActivityKind, ActivityStatus, Root } from "@meu-caderno/core";

const emit = defineEmits<{ done: []; close: [] }>();

const { service, ids } = useCadernoService();

const text = ref("");
const saving = ref(false);

async function save() {
  const trimmed = text.value.trim();
  if (!trimmed || saving.value) return;
  saving.value = true;
  await service.upsertActivity({
    id: await ids.newId(),
    title: trimmed,
    kind: ActivityKind.CAPTURE,
    status: ActivityStatus.OPEN,
    root: Root.INBOX,
  });
  saving.value = false;
  emit("done");
}
</script>

<template>
  <UIModal
    title="Captura rápida"
    subtitle="solte na Inbox e organize depois"
    @close="emit('close')"
  >
    <div class="capture">
      <textarea
        v-model="text"
        class="capture__input"
        rows="3"
        placeholder="Uma tarefa, ideia ou lembrete…"
        @keydown.enter.exact.prevent="save"
      />
      <span class="capture__hint">
        Enter salva · Shift+Enter quebra linha · fica neste aparelho.
      </span>
      <div class="capture__actions">
        <UIButton variant="fantasma" label="Fechar" @click="emit('close')" />
        <UIButton
          variant="primal"
          icon="check"
          :label="saving ? 'Capturando…' : 'Capturar'"
          @click="save"
        />
      </div>
    </div>
  </UIModal>
</template>

<style scoped>
.capture {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.capture__input {
  font-family: inherit;
  font-size: calc(16px * var(--pt-text-scale));
  line-height: 1.5;
  padding: 12px 14px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink);
  width: 100%;
  resize: vertical;
}
.capture__input:focus {
  outline: none;
  border-color: var(--pt-ink);
}
.capture__hint {
  font-size: calc(11px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
.capture__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}
</style>
