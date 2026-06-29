<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "reka-ui";

defineProps<{ title: string; subtitle?: string }>();
const emit = defineEmits<{ close: [] }>();

function onOpenChange(value: boolean) {
  if (!value) emit("close");
}
</script>

<template>
  <DialogRoot :open="true" @update:open="onOpenChange">
    <DialogPortal>
      <DialogOverlay class="modal__backdrop" />
      <DialogContent class="modal__sheet">
        <header class="modal__head">
          <div>
            <DialogTitle class="pt-hand modal__title">{{ title }}</DialogTitle>
            <DialogDescription v-if="subtitle" class="modal__sub">
              {{ subtitle }}
            </DialogDescription>
          </div>
          <DialogClose class="modal__x" aria-label="Fechar">
            <UIIcon icon="x" :size="18" />
          </DialogClose>
        </header>
        <div class="modal__body">
          <slot />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.modal__backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(44, 42, 39, 0.4);
}
.modal__sheet {
  position: fixed;
  z-index: 51;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 100%;
  max-width: 460px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: var(--pt-paper);
  border: 2px solid var(--pt-ink);
  border-radius: 18px 18px 0 0;
  box-shadow: 0 -8px 40px rgba(44, 42, 39, 0.24);
}
@media (min-width: 560px) {
  .modal__sheet {
    top: 50%;
    bottom: auto;
    transform: translate(-50%, -50%);
    border-radius: 18px;
    box-shadow: 0 18px 50px rgba(44, 42, 39, 0.28);
  }
}
.modal__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 18px 12px;
  border-bottom: 1.5px dashed var(--pt-border-faint);
}
.modal__title {
  font-size: calc(22px * var(--pt-text-scale));
  font-weight: 700;
  margin: 0;
}
.modal__sub {
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  margin: 3px 0 0;
}
.modal__x {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--pt-radius-sm);
  border: none;
  background: var(--pt-card);
  color: var(--pt-ink-soft);
  cursor: pointer;
}
.modal__body {
  overflow-y: auto;
  padding: 16px 18px 20px;
}
</style>
