<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    values: number[];
    width?: number;
    height?: number;
    stroke?: number;
    color?: string;
    fill?: boolean;
    fillColor?: string;
    dot?: boolean;
  }>(),
  {
    width: 120,
    height: 32,
    stroke: 2,
    color: "#3f6fb0",
    fill: false,
    dot: true,
  },
);

const geom = computed(() => {
  const values = props.values.length ? props.values : [0];
  const { width, height, stroke } = props;
  const pad = stroke + 1;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const n = values.length;
  const xAt = (i: number) =>
    n === 1 ? width / 2 : pad + (i * (width - 2 * pad)) / (n - 1);
  const yAt = (v: number) =>
    height - pad - ((v - min) / span) * (height - 2 * pad);
  const pts = values.map((v, i) => `${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`);
  const points = pts.join(" ");
  return {
    points,
    fillPoints: `${pad},${height - pad} ${points} ${width - pad},${height - pad}`,
    lastX: xAt(n - 1).toFixed(1),
    lastY: yAt(values.at(-1) ?? 0).toFixed(1),
    dotR: stroke + 1,
  };
});

const fillColor = computed(() => props.fillColor ?? `${props.color}22`);
</script>

<template>
  <svg
    :width="width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
    class="pt-spark"
  >
    <polygon
      v-if="fill"
      :points="geom.fillPoints"
      :fill="fillColor"
      stroke="none"
    />
    <polyline
      :points="geom.points"
      fill="none"
      :stroke="color"
      :stroke-width="stroke"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <circle
      v-if="dot"
      :cx="geom.lastX"
      :cy="geom.lastY"
      :r="geom.dotR"
      :fill="color"
    />
  </svg>
</template>

<style scoped>
.pt-spark {
  display: block;
  overflow: visible;
}
</style>
