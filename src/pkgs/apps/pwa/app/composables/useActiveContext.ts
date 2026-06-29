import type { Id } from "@meu-caderno/core";

const PREF_ID = "default" as Id;

export function useActiveContext() {
  const { config } = useCadernoService();
  const activeId = useState<Id | null>("caderno:activeContext", () => null);
  const hydrated = useState<boolean>(
    "caderno:activeContext:hydrated",
    () => false,
  );

  async function hydrate() {
    if (hydrated.value) return;
    const prefs = await config.preferences.get(PREF_ID);
    activeId.value = prefs?.activeContextId ?? null;
    hydrated.value = true;
  }

  async function setActive(id: Id) {
    activeId.value = id;
    await config.preferences.put({ id: PREF_ID, activeContextId: id });
  }

  return { activeId, hydrate, setActive };
}
