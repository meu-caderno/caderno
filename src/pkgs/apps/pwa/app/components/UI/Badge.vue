<script setup lang="ts">
type Tone =
  | "atencao"
  | "ok"
  | "perigo"
  | "info"
  | "neutro"
  | "externa"
  | "custom";

interface ToneSpec {
  bg: string;
  bd: string;
  tx: string;
  dashed?: boolean;
}

const TONES: Record<Exclude<Tone, "custom">, ToneSpec> = {
  atencao: { bg: "#fbf1d8", bd: "#b8862b", tx: "#9a6f1f" },
  ok: { bg: "#e3efe4", bd: "#2f7d4f", tx: "#2f7d4f" },
  perigo: { bg: "#f8e3df", bd: "#c0392b", tx: "#c0392b" },
  info: { bg: "#e4edf6", bd: "#3f6fb0", tx: "#3f6fb0" },
  neutro: { bg: "#efe9dc", bd: "#c4beb0", tx: "#8a8780" },
  externa: { bg: "transparent", bd: "#7aa7d8", tx: "#3f5f80", dashed: true },
};

const props = withDefaults(
  defineProps<{
    label?: string;
    tone?: Tone;
    color?: string;
    bg?: string;
    bordered?: boolean;
    size?: "sm" | "md";
    dot?: boolean;
  }>(),
  { tone: "neutro", size: "sm", bordered: false, dot: false },
);

const spec = computed(() => {
  const sm = props.size === "sm";
  const isCustom = props.tone === "custom" || props.color != null;
  let bg: string;
  let bd: string;
  let tx: string;
  let dashed = false;
  let hasBorder: boolean;
  if (isCustom) {
    tx = props.color ?? "#8a8780";
    bg = props.bg ?? "transparent";
    bd = props.color ?? "#c4beb0";
    hasBorder = props.bordered;
  } else {
    const t = TONES[props.tone as Exclude<Tone, "custom">] ?? TONES.neutro;
    bg = t.bg;
    bd = t.bd;
    tx = t.tx;
    dashed = !!t.dashed;
    hasBorder = true;
  }
  const border = hasBorder
    ? `${sm ? "1px" : "1.5px"} ${dashed ? "dashed" : "solid"} ${bd}`
    : "none";
  return {
    badge: {
      fontSize: sm ? "10px" : "11px",
      padding: sm ? "3px 9px" : "3px 10px",
      background: bg,
      border,
      color: tx,
    },
    dot: bd,
  };
});
</script>

<template>
  <span class="pt-badge" :style="spec.badge">
    <span v-if="dot" class="pt-badge__dot" :style="{ background: spec.dot }" />
    <slot>{{ label }}</slot>
  </span>
</template>

<style scoped>
.pt-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: inherit;
  font-weight: 700;
  line-height: 1;
  border-radius: var(--pt-radius-pill);
  white-space: nowrap;
  letter-spacing: 0.01em;
}
.pt-badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
