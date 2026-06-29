<script setup lang="ts">
import { HOME_WIDGETS, useLayout } from "~/composables/useLayout";
import { NAV_ITEMS, PINNED_NAV_KEYS } from "~/composables/useNav";

const {
  homeWidgets,
  tabItems,
  railItems,
  isVisible,
  toggleWidget,
  toggleTab,
  toggleRail,
} = useLayout();

const widgetKeys = HOME_WIDGETS.map((widget) => widget.key);
const navKeys = NAV_ITEMS.map((item) => item.key);

function isPinned(key: string) {
  return PINNED_NAV_KEYS.includes(key);
}
</script>

<template>
  <UICard pad="18px" class="layout-card">
    <div class="layout-card__head">
      <h2 class="pt-hand layout-card__title">Layout</h2>
      <p class="layout-card__sub">O que aparece na Home e na navegação.</p>
    </div>

    <div class="layout-card__group">
      <span class="pt-eyebrow">Widgets da Home</span>
      <div
        v-for="widget in HOME_WIDGETS"
        :key="widget.key"
        class="layout-card__row"
      >
        <span class="layout-card__label">{{ widget.label }}</span>
        <UISwitch
          :model-value="isVisible(homeWidgets, widget.key)"
          @update:model-value="toggleWidget(widget.key, widgetKeys)"
        />
      </div>
    </div>

    <div class="layout-card__group">
      <span class="pt-eyebrow">Barra do celular</span>
      <div v-for="item in NAV_ITEMS" :key="item.key" class="layout-card__row">
        <span class="layout-card__label">{{ item.icon }} {{ item.label }}</span>
        <UISwitch
          :model-value="isVisible(tabItems, item.key)"
          :disabled="isPinned(item.key)"
          @update:model-value="toggleTab(item.key, navKeys, PINNED_NAV_KEYS)"
        />
      </div>
    </div>

    <div class="layout-card__group">
      <span class="pt-eyebrow">Barra lateral (desktop)</span>
      <div v-for="item in NAV_ITEMS" :key="item.key" class="layout-card__row">
        <span class="layout-card__label">{{ item.icon }} {{ item.label }}</span>
        <UISwitch
          :model-value="isVisible(railItems, item.key)"
          :disabled="isPinned(item.key)"
          @update:model-value="toggleRail(item.key, navKeys, PINNED_NAV_KEYS)"
        />
      </div>
    </div>
  </UICard>
</template>

<style scoped>
.layout-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.layout-card__title {
  font-size: calc(19px * var(--pt-text-scale));
  font-weight: 700;
  margin: 0;
}
.layout-card__sub {
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
  margin: 4px 0 0;
}
.layout-card__group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.layout-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.layout-card__label {
  font-size: calc(14px * var(--pt-text-scale));
  font-weight: 600;
}
</style>
