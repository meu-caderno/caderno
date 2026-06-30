<script setup lang="ts">
import type { LibraryItem } from "@meu-caderno/core";

const props = defineProps<{ item: LibraryItem }>();
const emit = defineEmits<{ edit: [] }>();

const progressPct = computed(() =>
  Math.round((props.item.progress ?? 0) * 100),
);
const stars = computed(() => props.item.stars ?? 0);
const stateLabel = computed(() => LIBRARY_STATE_LABEL[stateOf(props.item)]);
const reviewCount = computed(() => props.item.reviews?.length ?? 0);
</script>

<template>
  <button type="button" class="item-card" @click="emit('edit')">
    <div class="item-card__cover">{{ item.cover ?? "📚" }}</div>
    <div class="item-card__body">
      <div class="item-card__title">{{ item.title }}</div>
      <div v-if="item.synopsis" class="item-card__synopsis">
        {{ item.synopsis }}
      </div>
      <div class="item-card__meta">
        <span class="item-card__badge">{{ stateLabel }}</span>
        <span v-if="stars" class="item-card__stars">
          {{ "★".repeat(stars) }}
        </span>
        <span v-if="progressPct" class="item-card__progress">
          {{ progressPct }}%
        </span>
        <span v-if="reviewCount" class="item-card__progress">
          {{ reviewCount }} resenha{{ reviewCount > 1 ? "s" : "" }}
        </span>
      </div>
    </div>
  </button>
</template>

<style scoped>
.item-card {
  display: flex;
  gap: 12px;
  width: 100%;
  text-align: left;
  font-family: inherit;
  padding: 12px 14px;
  border-radius: var(--pt-radius);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink);
  cursor: pointer;
  box-shadow: var(--pt-shadow);
}
.item-card__cover {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: calc(24px * var(--pt-text-scale));
  border-radius: var(--pt-radius-sm);
  background: var(--pt-paper-2);
}
.item-card__body {
  flex: 1;
  min-width: 0;
}
.item-card__title {
  font-size: calc(15px * var(--pt-text-scale));
  font-weight: 700;
}
.item-card__synopsis {
  font-size: calc(12px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  margin-top: 2px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.item-card__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
  font-size: calc(12px * var(--pt-text-scale));
}
.item-card__badge {
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: calc(10px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  background: var(--pt-paper-2);
  padding: 2px 8px;
  border-radius: var(--pt-radius-pill);
}
.item-card__stars {
  color: var(--pt-warn);
  letter-spacing: 1px;
}
.item-card__progress {
  color: var(--pt-ink-soft);
  font-variant-numeric: tabular-nums;
}
</style>
