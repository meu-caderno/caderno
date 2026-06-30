import type { Context, Id } from "@meu-caderno/core";
import { pickEffectiveContextId } from "~/utils/contexts";

export function useActiveContext() {
  const { store } = useCadernoService();
  const { read, patch } = usePreferences();
  const activeId = useState<Id | null>("caderno:activeContext", () => null);
  const focusIds = useState<Id[]>("caderno:contextFocus", () => []);
  const hydrated = useState<boolean>(
    "caderno:activeContext:hydrated",
    () => false,
  );

  const allContexts = useLiveQuery(
    ["contexts"],
    () => store.contexts.list(),
    [] as Context[],
  );

  const contexts = computed(() => {
    const focus = focusIds.value;
    return [...allContexts.value]
      .filter((context) => !context.archived)
      .filter(
        (context) =>
          focus.length === 0 ||
          focus.includes(context.id) ||
          context.id === activeId.value,
      )
      .sort(
        (left, right) =>
          Number(right.pinned ?? false) - Number(left.pinned ?? false),
      );
  });

  const effectiveId = computed<Id | null>(() =>
    pickEffectiveContextId(
      contexts.value.map((context) => context.id),
      activeId.value,
    ),
  );

  const context = computed(
    () =>
      contexts.value.find((entry) => entry.id === effectiveId.value) ?? null,
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

  return {
    activeId,
    effectiveId,
    focusIds,
    contexts,
    context,
    hydrate,
    setActive,
    setFocus,
    toggleFocus,
  };
}
