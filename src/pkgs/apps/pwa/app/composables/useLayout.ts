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
    return allKeys.filter((entry) => current.includes(entry) || entry === key);
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

  return {
    homeWidgets,
    tabItems,
    railItems,
    hydrate,
    isVisible,
    toggleWidget,
    toggleTab,
    toggleRail,
  };
}
