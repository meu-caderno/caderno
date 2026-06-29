<script setup lang="ts">
import { CheckboxIndicator, CheckboxRoot } from "reka-ui";

const model = defineModel<boolean>({ default: false });
defineProps<{ label?: string }>();
</script>

<template>
  <label class="uicb">
    <CheckboxRoot v-model="model" class="uicb__box">
      <CheckboxIndicator class="uicb__ind">
        <UIIcon icon="check" :size="13" />
      </CheckboxIndicator>
    </CheckboxRoot>
    <span v-if="label" class="uicb__label">{{ label }}</span>
  </label>
</template>

<style scoped>
.uicb {
  display: flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
}
.uicb__box {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
.uicb__box[data-state="checked"] {
  background: var(--pt-ink);
  border-color: var(--pt-ink);
}
.uicb__ind {
  color: var(--pt-paper);
  display: inline-flex;
}
.uicb__label {
  font-size: 14px;
}
</style>
