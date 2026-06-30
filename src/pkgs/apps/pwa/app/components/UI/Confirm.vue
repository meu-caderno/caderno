<script setup lang="ts">
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AlertDialogTitle,
} from "reka-ui";

defineProps<{
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}>();
const emit = defineEmits<{ confirm: []; cancel: [] }>();

function onOpenChange(value: boolean) {
  if (!value) emit("cancel");
}
</script>

<template>
  <AlertDialogRoot :open="true" @update:open="onOpenChange">
    <AlertDialogPortal>
      <AlertDialogOverlay class="uiad__backdrop" />
      <AlertDialogContent class="uiad__sheet">
        <AlertDialogTitle class="pt-hand uiad__title">{{ title }}</AlertDialogTitle>
        <AlertDialogDescription v-if="description" class="uiad__desc">
          {{ description }}
        </AlertDialogDescription>
        <div class="uiad__actions">
          <AlertDialogCancel class="uiad__btn" @click="emit('cancel')">
            {{ cancelLabel ?? "Cancelar" }}
          </AlertDialogCancel>
          <AlertDialogAction
            class="uiad__btn uiad__btn--primary"
            :class="{ 'uiad__btn--danger': danger }"
            @click="emit('confirm')"
          >
            {{ confirmLabel ?? "Confirmar" }}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialogPortal>
  </AlertDialogRoot>
</template>

<style scoped>
.uiad__backdrop {
  position: fixed;
  inset: 0;
  z-index: 55;
  background: rgba(var(--pt-ink-rgb), 0.4);
}
.uiad__sheet {
  position: fixed;
  z-index: 56;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% - 32px);
  max-width: 380px;
  background: var(--pt-paper);
  border: 2px solid var(--pt-ink);
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 18px 50px rgba(var(--pt-ink-rgb), 0.28);
}
.uiad__title {
  font-size: calc(21px * var(--pt-text-scale));
  font-weight: 700;
  margin: 0 0 6px;
}
.uiad__desc {
  font-size: calc(14px * var(--pt-text-scale));
  line-height: 1.5;
  color: var(--pt-ink-muted);
  margin: 0 0 18px;
}
.uiad__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.uiad__btn {
  font-family: inherit;
  font-size: calc(14px * var(--pt-text-scale));
  font-weight: 600;
  padding: 9px 16px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink-soft);
  cursor: pointer;
}
.uiad__btn--primary {
  background: var(--pt-ink);
  border-color: var(--pt-ink);
  color: var(--pt-paper);
}
.uiad__btn--danger {
  background: var(--pt-danger);
  border-color: var(--pt-danger);
}
</style>
