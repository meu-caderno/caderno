import type { Id } from "@meu-caderno/core";

const PREF_ID = "default" as Id;

export function useActiveContext() {
  const { config } = useCadernoService();
  const activeId = useState<Id | null>("caderno:activeContext", () => null);
  const focusIds = useState<Id[]>("caderno:contextFocus", () => []);
  const hydrated = useState<boolean>(
    "caderno:activeContext:hydrated",
    () => false,
  );

  async function hydrate() {
    if (hydrated.value) return;
    const prefs = await config.preferences.get(PREF_ID);
    activeId.value = prefs?.activeContextId ?? null;
    focusIds.value = prefs?.profileContexts ?? [];
    hydrated.value = true;
  }

  async function setActive(id: Id) {
    activeId.value = id;
    const previous = await config.preferences.get(PREF_ID);
    await config.preferences.put({
      ...previous,
      id: PREF_ID,
      activeContextId: id,
    });
  }

  async function setFocus(ids: Id[]) {
    focusIds.value = ids;
    const previous = await config.preferences.get(PREF_ID);
    await config.preferences.put({
      ...previous,
      id: PREF_ID,
      profileContexts: ids,
    });
  }

  function toggleFocus(id: Id) {
    const next = focusIds.value.includes(id)
      ? focusIds.value.filter((current) => current !== id)
      : [...focusIds.value, id];
    return setFocus(next);
  }

  return { activeId, focusIds, hydrate, setActive, setFocus, toggleFocus };
}
