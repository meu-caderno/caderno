import { NAV_ITEMS } from "~/composables/useNav";

export interface WorkbenchTab {
  path: string;
  label: string;
  icon: string;
}

const SEGMENT_LABEL: Record<string, string> = {
  contexto: "Contexto",
};

export function useWorkbenchTabs() {
  const route = useRoute();
  const tabs = useState<string[]>("wb:tabs", () => []);

  function describe(path: string): WorkbenchTab {
    const navItem = NAV_ITEMS.find((item) => item.to === path);
    if (navItem) return { path, label: navItem.label, icon: navItem.icon };
    const segment = path.split("/").filter(Boolean)[0] ?? "";
    return {
      path,
      label: SEGMENT_LABEL[segment] ?? segment ?? "Tela",
      icon: "📄",
    };
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
