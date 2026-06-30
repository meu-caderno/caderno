import type { Context } from "@meu-caderno/core";
import { NAV_ITEMS } from "~/composables/useNav";

export interface WorkbenchTab {
  path: string;
  label: string;
  icon: string;
}

export function useWorkbenchTabs() {
  const route = useRoute();
  const { store } = useCadernoService();
  const tabs = useState<string[]>("wb:tabs", () => []);
  const contexts = useLiveQuery(
    ["contexts"],
    () => store.contexts.list(),
    [] as Context[],
  );

  function describe(path: string): WorkbenchTab {
    const navItem = NAV_ITEMS.find((item) => item.to === path);
    if (navItem) return { path, label: navItem.label, icon: navItem.icon };
    const segments = path.split("/").filter(Boolean);
    if (segments[0] === "contexto" && segments[1]) {
      const found = contexts.value.find((entry) => entry.id === segments[1]);
      return { path, label: found?.name ?? "Contexto", icon: "🧭" };
    }
    return { path, label: segments[0] ?? "Tela", icon: "📄" };
  }

  const items = computed<WorkbenchTab[]>(() => tabs.value.map(describe));

  watch(
    () => route.path,
    (path) => {
      if (!tabs.value.includes(path)) tabs.value = [...tabs.value, path];
    },
    { immediate: true },
  );

  function activate(path: string) {
    if (path !== route.path) void navigateTo(path);
  }

  function close(path: string) {
    const index = tabs.value.indexOf(path);
    const next = tabs.value.filter((entry) => entry !== path);
    tabs.value = next;
    if (route.path === path && next.length) {
      const fallback = next[Math.min(index, next.length - 1)] ?? next[0];
      if (fallback) void navigateTo(fallback);
    }
  }

  function setTabs(paths: string[]) {
    tabs.value = [...paths];
  }

  return { tabs, items, activate, close, setTabs };
}
