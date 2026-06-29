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

function runAction(t: ToastItem) {
  t.onAction?.();
  dismiss(t.id);
}
function onOpenChange(id: number, open: boolean) {
  if (!open) dismiss(id);
}
</script>

<template>
  <ToastProvider :duration="6000">
    <ToastRoot
      v-for="t in toasts"
      :key="t.id"
      class="uitoast"
      @update:open="(o: boolean) => onOpenChange(t.id, o)"
    >
      <div class="uitoast__body">
        <ToastTitle class="uitoast__title">{{ t.title }}</ToastTitle>
        <ToastDescription v-if="t.description" class="uitoast__desc">
          {{ t.description }}
        </ToastDescription>
      </div>
      <ToastAction
        v-if="t.actionLabel"
        :alt-text="t.actionLabel"
        class="uitoast__action"
        @click="runAction(t)"
      >
        {{ t.actionLabel }}
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
  box-shadow: 0 10px 30px rgba(44, 42, 39, 0.3);
}
.uitoast__body {
  flex: 1;
  min-width: 0;
}
.uitoast__title {
  font-size: 14px;
  font-weight: 600;
}
.uitoast__desc {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 2px;
}
.uitoast__action {
  flex-shrink: 0;
  font-family: inherit;
  font-size: 13px;
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
