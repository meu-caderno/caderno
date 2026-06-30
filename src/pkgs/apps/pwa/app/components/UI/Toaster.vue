<script setup lang="ts">
import {
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastViewport,
} from "reka-ui";
import type { ToastItem } from "~/composables/useToast";

const { toasts, dismiss } = useToast();

function runAction(toast: ToastItem) {
  toast.onAction?.();
  dismiss(toast.id);
}
function onOpenChange(id: number, open: boolean) {
  if (!open) dismiss(id);
}
</script>

<template>
  <ToastProvider :duration="6000">
    <ToastRoot
      v-for="toast in toasts"
      :key="toast.id"
      class="uitoast"
      @update:open="(isOpen: boolean) => onOpenChange(toast.id, isOpen)"
    >
      <div class="uitoast__body">
        <ToastTitle class="uitoast__title">{{ toast.title }}</ToastTitle>
        <ToastDescription v-if="toast.description" class="uitoast__desc">
          {{ toast.description }}
        </ToastDescription>
      </div>
      <ToastAction
        v-if="toast.actionLabel"
        :alt-text="toast.actionLabel"
        class="uitoast__action"
        @click="runAction(toast)"
      >
        {{ toast.actionLabel }}
      </ToastAction>
      <ToastClose class="uitoast__close" aria-label="Fechar">
        <UIIcon icon="x" :size="15" />
      </ToastClose>
    </ToastRoot>
    <ToastViewport class="uitoast__vp" />
  </ToastProvider>
</template>

<style scoped>
.uitoast__vp {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 70;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: calc(100% - 24px);
  max-width: 440px;
  padding: 16px 0;
  margin: 0;
  list-style: none;
}
.uitoast {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--pt-ink);
  color: var(--pt-paper);
  padding: 12px 14px;
  border-radius: var(--pt-radius-md);
  box-shadow: 0 10px 30px rgba(var(--pt-ink-rgb), 0.3);
}
.uitoast__body {
  flex: 1;
  min-width: 0;
}
.uitoast__title {
  font-size: calc(14px * var(--pt-text-scale));
  font-weight: 600;
}
.uitoast__desc {
  font-size: calc(12px * var(--pt-text-scale));
  opacity: 0.8;
  margin-top: 2px;
}
.uitoast__action {
  flex-shrink: 0;
  font-family: inherit;
  font-size: calc(13px * var(--pt-text-scale));
  font-weight: 700;
  padding: 6px 10px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid rgba(244, 241, 234, 0.3);
  background: none;
  color: var(--pt-paper);
  cursor: pointer;
}
.uitoast__close {
  flex-shrink: 0;
  display: inline-flex;
  background: none;
  border: none;
  color: var(--pt-paper);
  opacity: 0.7;
  cursor: pointer;
}
</style>
