import type { LibraryItem } from "@meu-caderno/core";

export function useLibrary() {
  const { store } = useCadernoService();
  const items = useLiveQuery<LibraryItem[]>(
    ["library"],
    () => store.library.list(),
    [],
  );
  return { items };
}
