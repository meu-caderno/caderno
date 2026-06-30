import type { Id, Workbench } from "@meu-caderno/core";

export function useWorkbenches() {
  const { ids } = useCadernoService();
  const { read, patch } = usePreferences();
  const { activeId, setActive } = useActiveContext();
  const route = useRoute();
  const benches = useState<Workbench[]>("caderno:workbenches", () => []);
  const hydrated = useState<boolean>(
    "caderno:workbenches:hydrated",
    () => false,
  );

  async function hydrate() {
    if (hydrated.value) return;
    const prefs = await read();
    benches.value = prefs?.workbenches ?? [];
    hydrated.value = true;
  }

  async function persist(next: Workbench[]) {
    benches.value = next;
    await patch({ workbenches: next });
  }

  async function save(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const bench: Workbench = {
      id: await ids.newId(),
      name: trimmed,
      route: route.path,
      contextId: activeId.value ?? undefined,
    };
    await persist([...benches.value, bench]);
  }

  async function remove(id: Id) {
    await persist(benches.value.filter((bench) => bench.id !== id));
  }

  async function invoke(bench: Workbench) {
    if (bench.contextId) await setActive(bench.contextId);
    await navigateTo(bench.route);
  }

  return { benches, hydrate, save, remove, invoke };
}
