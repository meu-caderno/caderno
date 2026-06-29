<script setup lang="ts">
import { HOME_WIDGETS, useLayout } from "~/composables/useLayout";
import { NAV_ITEMS, PINNED_NAV_KEYS } from "~/composables/useNav";
import { reorderByEdge, type SortablePayload } from "~/utils/sortable";

const {
  homeWidgets,
  tabItems,
  railItems,
  ordered,
  toggleWidget,
  toggleTab,
  toggleRail,
  moveWidget,
  moveTab,
  moveRail,
  reorderWidgets,
  reorderTabs,
  reorderRail,
} = useLayout();

const widgetKeys = HOME_WIDGETS.map((widget) => widget.key);
const navKeys = NAV_ITEMS.map((item) => item.key);

function widgetLabel(key: string) {
  return HOME_WIDGETS.find((widget) => widget.key === key)?.label ?? key;
}
function navLabel(key: string) {
  const item = NAV_ITEMS.find((nav) => nav.key === key);
  return item ? `${item.icon} ${item.label}` : key;
}
function isPinned(key: string) {
  return PINNED_NAV_KEYS.includes(key);
}

function split(list: string[] | null, allKeys: string[]) {
  const visible = ordered(list, allKeys);
  const hidden = allKeys.filter((key) => !visible.includes(key));
  return { visible, hidden };
}

const widgets = computed(() => split(homeWidgets.value, widgetKeys));
const tabs = computed(() => split(tabItems.value, navKeys));
const rails = computed(() => split(railItems.value, navKeys));

const same = (key: string) => key;

function onReorderWidgets({ fromId, toId, edge }: SortablePayload) {
  reorderWidgets(
    reorderByEdge(widgets.value.visible, fromId, toId, edge, same),
  );
}
function onReorderTabs({ fromId, toId, edge }: SortablePayload) {
  reorderTabs(reorderByEdge(tabs.value.visible, fromId, toId, edge, same));
}
function onReorderRail({ fromId, toId, edge }: SortablePayload) {
  reorderRail(reorderByEdge(rails.value.visible, fromId, toId, edge, same));
}
</script>

<template>
  <UICard pad="18px" class="layout-card">
    <div class="layout-card__head">
      <h2 class="pt-hand layout-card__title">Layout</h2>
      <p class="layout-card__sub">
        Arraste pela alça (ou use ↑/↓) para reordenar; ligue/desligue à direita.
      </p>
    </div>

    <div class="layout-card__group">
      <span class="pt-eyebrow">Widgets da Home</span>
      <UISortable @reorder="onReorderWidgets">
        <UISortableItem
          v-for="(key, index) in widgets.visible"
          :id="key"
          :key="key"
        >
          <div class="layout-card__rowinner">
            <div class="layout-card__move">
              <button
                type="button"
                class="layout-card__arrow"
                :disabled="index === 0"
                aria-label="Subir"
                @click="moveWidget(key, widgetKeys, -1)"
              >
                <UIIcon icon="chevron-up" :size="14" />
              </button>
              <button
                type="button"
                class="layout-card__arrow"
                :disabled="index === widgets.visible.length - 1"
                aria-label="Descer"
                @click="moveWidget(key, widgetKeys, 1)"
              >
                <UIIcon icon="chevron-down" :size="14" />
              </button>
            </div>
            <span class="layout-card__label">{{ widgetLabel(key) }}</span>
            <UISwitch
              :model-value="true"
              @update:model-value="toggleWidget(key, widgetKeys)"
            />
          </div>
        </UISortableItem>
      </UISortable>
      <div
        v-for="key in widgets.hidden"
        :key="key"
        class="layout-card__row layout-card__row--off"
      >
        <span class="layout-card__label">{{ widgetLabel(key) }}</span>
        <UISwitch
          :model-value="false"
          @update:model-value="toggleWidget(key, widgetKeys)"
        />
      </div>
    </div>

    <div class="layout-card__group">
      <span class="pt-eyebrow">Barra do celular</span>
      <UISortable @reorder="onReorderTabs">
        <UISortableItem
          v-for="(key, index) in tabs.visible"
          :id="key"
          :key="key"
        >
          <div class="layout-card__rowinner">
            <div class="layout-card__move">
              <button
                type="button"
                class="layout-card__arrow"
                :disabled="index === 0"
                aria-label="Subir"
                @click="moveTab(key, navKeys, -1)"
              >
                <UIIcon icon="chevron-up" :size="14" />
              </button>
              <button
                type="button"
                class="layout-card__arrow"
                :disabled="index === tabs.visible.length - 1"
                aria-label="Descer"
                @click="moveTab(key, navKeys, 1)"
              >
                <UIIcon icon="chevron-down" :size="14" />
              </button>
            </div>
            <span class="layout-card__label">{{ navLabel(key) }}</span>
            <UISwitch
              :model-value="true"
              :disabled="isPinned(key)"
              @update:model-value="toggleTab(key, navKeys, PINNED_NAV_KEYS)"
            />
          </div>
        </UISortableItem>
      </UISortable>
      <div
        v-for="key in tabs.hidden"
        :key="key"
        class="layout-card__row layout-card__row--off"
      >
        <span class="layout-card__label">{{ navLabel(key) }}</span>
        <UISwitch
          :model-value="false"
          @update:model-value="toggleTab(key, navKeys, PINNED_NAV_KEYS)"
        />
      </div>
    </div>

    <div class="layout-card__group">
      <span class="pt-eyebrow">Barra lateral (desktop)</span>
      <UISortable @reorder="onReorderRail">
        <UISortableItem
          v-for="(key, index) in rails.visible"
          :id="key"
          :key="key"
        >
          <div class="layout-card__rowinner">
            <div class="layout-card__move">
              <button
                type="button"
                class="layout-card__arrow"
                :disabled="index === 0"
                aria-label="Subir"
                @click="moveRail(key, navKeys, -1)"
              >
                <UIIcon icon="chevron-up" :size="14" />
              </button>
              <button
                type="button"
                class="layout-card__arrow"
                :disabled="index === rails.visible.length - 1"
                aria-label="Descer"
                @click="moveRail(key, navKeys, 1)"
              >
                <UIIcon icon="chevron-down" :size="14" />
              </button>
            </div>
            <span class="layout-card__label">{{ navLabel(key) }}</span>
            <UISwitch
              :model-value="true"
              :disabled="isPinned(key)"
              @update:model-value="toggleRail(key, navKeys, PINNED_NAV_KEYS)"
            />
          </div>
        </UISortableItem>
      </UISortable>
      <div
        v-for="key in rails.hidden"
        :key="key"
        class="layout-card__row layout-card__row--off"
      >
        <span class="layout-card__label">{{ navLabel(key) }}</span>
        <UISwitch
          :model-value="false"
          @update:model-value="toggleRail(key, navKeys, PINNED_NAV_KEYS)"
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
.layout-card__rowinner,
.layout-card__row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.layout-card__row--off {
  opacity: 0.7;
}
.layout-card__move {
  display: inline-flex;
  gap: 2px;
}
.layout-card__arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: var(--pt-radius-sm);
  border: 1.5px solid var(--pt-border-muted);
  background: var(--pt-card);
  color: var(--pt-ink-soft);
  cursor: pointer;
}
.layout-card__arrow:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.layout-card__label {
  flex: 1;
  font-size: calc(14px * var(--pt-text-scale));
  font-weight: 600;
}
</style>
