import type { Id, Preferences } from "@meu-caderno/core";

const PREF_ID = "default" as Id;

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
  const { config } = useCadernoService();
  const homeWidgets = useState<VisibilityList>(
    "caderno:layout:widgets",
    () => null,
  );
  const tabItems = useState<VisibilityList>("caderno:layout:tabs", () => null);
  const railItems = useState<VisibilityList>("caderno:layout:rail", () => null);
  const hydrated = useState<boolean>("caderno:layout:hydrated", () => false);

  async function hydrate() {
    if (hydrated.value) return;
    const prefs = await config.preferences.get(PREF_ID);
    homeWidgets.value = prefs?.homeWidgets ?? null;
    tabItems.value = prefs?.tabItems ?? null;
    railItems.value = prefs?.railItems ?? null;
    hydrated.value = true;
  }

  async function persist(patch: Partial<Preferences>) {
    const prefs = await config.preferences.get(PREF_ID);
    await config.preferences.put({ ...prefs, ...patch, id: PREF_ID });
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

  async function toggleWidget(key: string, allKeys: string[]) {
    const next = nextList(homeWidgets.value, allKeys, key, []);
    homeWidgets.value = next;
    await persist({ homeWidgets: next });
  }

  async function toggleTab(key: string, allKeys: string[], pinned: string[]) {
    const next = nextList(tabItems.value, allKeys, key, pinned);
    tabItems.value = next;
    await persist({ tabItems: next });
  }

  async function toggleRail(key: string, allKeys: string[], pinned: string[]) {
    const next = nextList(railItems.value, allKeys, key, pinned);
    railItems.value = next;
    await persist({ railItems: next });
  }

  async function moveWidget(key: string, allKeys: string[], direction: -1 | 1) {
    const next = movedList(homeWidgets.value, allKeys, key, direction);
    homeWidgets.value = next;
    await persist({ homeWidgets: next });
  }

  async function moveTab(key: string, allKeys: string[], direction: -1 | 1) {
    const next = movedList(tabItems.value, allKeys, key, direction);
    tabItems.value = next;
    await persist({ tabItems: next });
  }

  async function moveRail(key: string, allKeys: string[], direction: -1 | 1) {
    const next = movedList(railItems.value, allKeys, key, direction);
    railItems.value = next;
    await persist({ railItems: next });
  }

  return {
    homeWidgets,
    tabItems,
    railItems,
    hydrate,
    isVisible,
    ordered,
    toggleWidget,
    toggleTab,
    toggleRail,
    moveWidget,
    moveTab,
    moveRail,
  };
}
