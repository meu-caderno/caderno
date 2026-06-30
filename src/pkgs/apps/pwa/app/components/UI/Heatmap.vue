<script setup lang="ts">
export type HeatStatus =
  | "presente"
  | "falta"
  | "atraso"
  | "atestado"
  | "none"
  | "vazio";

const PAL: Record<string, string> = {
  presente: "#2f7d4f",
  falta: "#c0392b",
  atraso: "#b8862b",
  atestado: "#3f6fb0",
  none: "#efe9dc",
  vazio: "#efe9dc",
};
const LABEL: Record<string, string> = {
  presente: "presente",
  falta: "falta",
  atraso: "atraso",
  atestado: "atestado",
  none: "sem aula",
};

const props = withDefaults(
  defineProps<{
    cells: readonly HeatStatus[] | readonly string[];
    cellSize?: number;
    gap?: number;
    radius?: number;
    columns?: number;
  }>(),
  { cellSize: 16, gap: 4, radius: 4, columns: 0 },
);

const items = computed(() =>
  props.cells.map((st) => {
    const known = PAL[st] != null && st !== "none" && st !== "vazio";
    return {
      title: LABEL[st] ?? st,
      style: {
        width: `${props.cellSize}px`,
        height: `${props.cellSize}px`,
        borderRadius: `${props.radius}px`,
        background: PAL[st] ?? PAL.none,
        border: known
          ? "1.5px solid rgba(var(--pt-ink-rgb), 0.12)"
          : "1.5px dashed #d8d2c4",
      },
    };
  }),
);

const wrapStyle = computed(() =>
  props.columns > 0
    ? {
        display: "grid",
        gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
        gap: `${props.gap}px`,
      }
    : { display: "flex", flexWrap: "wrap" as const, gap: `${props.gap}px` },
);
</script>

<template>
  <div :style="wrapStyle">
    <span
      v-for="(cell, i) in items"
      :key="i"
      class="pt-heat__cell"
      :style="cell.style"
      :title="cell.title"
    />
  </div>
</template>

<style scoped>
.pt-heat__cell {
  flex-shrink: 0;
  box-sizing: border-box;
}
</style>
