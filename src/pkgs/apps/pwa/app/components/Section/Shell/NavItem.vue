<script setup lang="ts">
const props = defineProps<{
  to: string;
  icon: string;
  label: string;
  layout: "rail" | "tab";
}>();

const route = useRoute();
const isActive = computed(() =>
  props.to === "/" ? route.path === "/" : route.path.startsWith(props.to),
);
</script>

<template>
  <NuxtLink
    :to="to"
    class="nav-item"
    :class="[`nav-item--${layout}`, { 'nav-item--active': isActive }]"
  >
    <span class="nav-item__icon">{{ icon }}</span>
    <span class="nav-item__label">{{ label }}</span>
  </NuxtLink>
</template>

<style scoped>
.nav-item {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--pt-ink-muted);
  font-weight: 600;
}
.nav-item__icon {
  line-height: 1;
}

/* Tab bar (mobile): vertical, compact */
.nav-item--tab {
  flex-direction: column;
  gap: 3px;
  flex: 1;
  padding: 7px 4px;
  font-size: calc(11px * var(--pt-text-scale));
}
.nav-item--tab .nav-item__icon {
  font-size: calc(21px * var(--pt-text-scale));
}
.nav-item--tab.nav-item--active {
  color: var(--pt-accent);
}

/* Rail (desktop): horizontal row */
.nav-item--rail {
  gap: 11px;
  padding: 10px 12px;
  border-radius: var(--pt-radius-sm);
  font-size: calc(14px * var(--pt-text-scale));
}
.nav-item--rail .nav-item__icon {
  font-size: calc(19px * var(--pt-text-scale));
}
.nav-item--rail:hover {
  background: var(--pt-card);
}
.nav-item--rail.nav-item--active {
  background: var(--pt-card);
  color: var(--pt-accent);
}
</style>
