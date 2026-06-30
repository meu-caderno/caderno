import type { EntityKey, StoreChange } from "@meu-caderno/core";

export function useLiveQuery<T>(
  keys: readonly EntityKey[],
  run: () => Promise<T>,
  initial: T,
) {
  const { store } = useCadernoService();
  const data = shallowRef<T>(initial);
  let scheduled = false;

  const rerun = async () => {
    data.value = await run();
  };

  const onChange = (changed: StoreChange) => {
    if (scheduled || !keys.some((key) => changed.has(key))) return;
    scheduled = true;
    queueMicrotask(async () => {
      scheduled = false;
      await rerun();
    });
  };

  onMounted(rerun);
  onUnmounted(store.subscribe(onChange));

  return data;
}
