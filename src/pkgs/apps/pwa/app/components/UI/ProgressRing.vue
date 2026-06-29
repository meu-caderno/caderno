<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    value?: number;
    size?: number;
    stroke?: number;
    color?: string;
    track?: string;
    centerText?: string;
    caption?: string;
  }>(),
  {
    value: 0,
    size: 84,
    stroke: 8,
    color: "var(--pt-ok)",
    track: "var(--pt-linen)",
  },
);

const clamped = computed(() => {
  const numeric = Number(props.value);
  return Number.isNaN(numeric) ? 0 : Math.max(0, Math.min(100, numeric));
});
const centerCoord = computed(() => props.size / 2);
const radius = computed(() => (props.size - props.stroke) / 2);
const circ = computed(() => 2 * Math.PI * radius.value);
const offset = computed(() => circ.value * (1 - clamped.value / 100));
const center = computed(
  () => props.centerText ?? `${Math.round(clamped.value)}%`,
);
const valSize = computed(() => Math.round(props.size * 0.27));
const capSize = computed(() => Math.max(8, Math.round(props.size * 0.11)));
</script>

<template>
  <div
    class="pt-ring"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <svg
      :width="size"
      :height="size"
      :viewBox="`0 0 ${size} ${size}`"
      class="pt-ring__svg"
    >
      <circle
        :cx="centerCoord"
        :cy="centerCoord"
        :r="radius"
        fill="none"
        :stroke="track"
        :stroke-width="stroke"
      />
      <circle
        :cx="centerCoord"
        :cy="centerCoord"
        :r="radius"
        fill="none"
        :stroke="color"
        :stroke-width="stroke"
        stroke-linecap="round"
        :stroke-dasharray="circ"
        :stroke-dashoffset="offset"
      />
    </svg>
    <div class="pt-ring__center">
      <div
        class="pt-ring__value"
        :style="{ fontSize: `${valSize}px`, color }"
      >
        {{ center }}
      </div>
      <div
        v-if="caption"
        class="pt-ring__caption"
        :style="{ fontSize: `${capSize}px` }"
      >
        {{ caption }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.pt-ring {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.pt-ring__svg {
  display: block;
  transform: rotate(-90deg);
}
.pt-ring__center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1;
}
.pt-ring__value {
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.pt-ring__caption {
  color: var(--pt-ink-faint);
  margin-top: 2px;
  font-weight: 600;
}
</style>
