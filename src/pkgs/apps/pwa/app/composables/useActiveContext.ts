import type { Id } from "@meu-caderno/core";

export function useActiveContext() {
  const { read, patch } = usePreferences();
  const activeId = useState<Id | null>("caderno:activeContext", () => null);
  const focusIds = useState<Id[]>("caderno:contextFocus", () => []);
  const hydrated = useState<boolean>(
    "caderno:activeContext:hydrated",
    () => false,
  );

  async function hydrate() {
    if (hydrated.value) return;
    const prefs = await read();
    activeId.value = prefs?.activeContextId ?? null;
    focusIds.value = prefs?.profileContexts ?? [];
    hydrated.value = true;
  }

  async function setActive(id: Id) {
    activeId.value = id;
    await patch({ activeContextId: id });
  }

  async function setFocus(ids: Id[]) {
    focusIds.value = ids;
    await patch({ profileContexts: ids });
  }

  function toggleFocus(id: Id) {
    const next = focusIds.value.includes(id)
      ? focusIds.value.filter((current) => current !== id)
      : [...focusIds.value, id];
    return setFocus(next);
  }

  return { activeId, focusIds, hydrate, setActive, setFocus, toggleFocus };
}
