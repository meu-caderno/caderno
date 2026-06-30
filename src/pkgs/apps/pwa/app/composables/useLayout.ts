import type { Preferences } from "@meu-caderno/core";
import type { Ref } from "vue";

type ListPreferenceKey = "homeWidgets" | "tabItems" | "railItems";

export interface HomeWidget {
  key: string;
  label: string;
}

export const HOME_WIDGETS: HomeWidget[] = [
  { key: "roll", label: "Aulas de hoje" },
  { key: "risk", label: "Alerta de risco" },
  { key: "goals", label: "Metas" },
  { key: "subjects", label: "Disciplinas" },
  { key: "activities", label: "Atividades" },
];

type VisibilityList = string[] | null;

export function useLayout() {
  const { read, patch: persist } = usePreferences();
  const homeWidgets = useState<VisibilityList>(
    "caderno:layout:widgets",
    () => null,
  );
  const tabItems = useState<VisibilityList>("caderno:layout:tabs", () => null);
  const railItems = useState<VisibilityList>("caderno:layout:rail", () => null);
  const hydrated = useState<boolean>("caderno:layout:hydrated", () => false);

  async function hydrate() {
    if (hydrated.value) return;
    const prefs = await read();
    homeWidgets.value = prefs?.homeWidgets ?? null;
    tabItems.value = prefs?.tabItems ?? null;
    railItems.value = prefs?.railItems ?? null;
    hydrated.value = true;
  }

  function isVisible(list: VisibilityList, key: string): boolean {
    return list === null || list.includes(key);
  }

  function ordered(list: VisibilityList, allKeys: string[]): string[] {
    return list ?? allKeys;
  }

  function nextList(
    list: VisibilityList,
    allKeys: string[],
    key: string,
    pinned: string[],
  ): string[] {
    const current = list ?? allKeys;
    if (current.includes(key)) {
      if (pinned.includes(key)) return current;
      return current.filter((entry) => entry !== key);
    }
    return [...current, key];
  }

  function movedList(
    list: VisibilityList,
    allKeys: string[],
    key: string,
    direction: -1 | 1,
  ): string[] {
    const current = [...(list ?? allKeys)];
    const from = current.indexOf(key);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= current.length) return current;
    const [moved] = current.splice(from, 1);
    current.splice(to, 0, moved as string);
    return current;
  }

  function makeListControls(
    listRef: Ref<VisibilityList>,
    prefKey: ListPreferenceKey,
  ) {
    async function commit(next: string[]) {
      listRef.value = next;
      await persist({ [prefKey]: next } as Partial<Preferences>);
    }
    return {
      toggle: (key: string, allKeys: string[], pinned: string[] = []) =>
        commit(nextList(listRef.value, allKeys, key, pinned)),
      move: (key: string, allKeys: string[], direction: -1 | 1) =>
        commit(movedList(listRef.value, allKeys, key, direction)),
      reorder: (visibleOrder: string[]) => commit(visibleOrder),
    };
  }

  const widgetControls = makeListControls(homeWidgets, "homeWidgets");
  const tabControls = makeListControls(tabItems, "tabItems");
  const railControls = makeListControls(railItems, "railItems");

  return {
    homeWidgets,
    tabItems,
    railItems,
    hydrate,
    isVisible,
    ordered,
    toggleWidget: (key: string, allKeys: string[]) =>
      widgetControls.toggle(key, allKeys),
    toggleTab: (key: string, allKeys: string[], pinned: string[]) =>
      tabControls.toggle(key, allKeys, pinned),
    toggleRail: (key: string, allKeys: string[], pinned: string[]) =>
      railControls.toggle(key, allKeys, pinned),
    moveWidget: (key: string, allKeys: string[], direction: -1 | 1) =>
      widgetControls.move(key, allKeys, direction),
    moveTab: (key: string, allKeys: string[], direction: -1 | 1) =>
      tabControls.move(key, allKeys, direction),
    moveRail: (key: string, allKeys: string[], direction: -1 | 1) =>
      railControls.move(key, allKeys, direction),
    reorderWidgets: widgetControls.reorder,
    reorderTabs: tabControls.reorder,
    reorderRail: railControls.reorder,
  };
}
