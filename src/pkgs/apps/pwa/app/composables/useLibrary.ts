import type { LibraryItem } from "@meu-caderno/core";
import { LibraryState } from "@meu-caderno/core";

export const LIBRARY_STATE_LABEL: Record<LibraryState, string> = {
  [LibraryState.WANT]: "Quero",
  [LibraryState.CONSUMING]: "Consumindo",
  [LibraryState.DONE]: "Concluído",
};

export const LIBRARY_STATE_ORDER: LibraryState[] = [
  LibraryState.WANT,
  LibraryState.CONSUMING,
  LibraryState.DONE,
];

export const LIBRARY_STATE_OPTIONS = LIBRARY_STATE_ORDER.map((state) => ({
  value: state,
  label: LIBRARY_STATE_LABEL[state],
}));

export function stateOf(item: LibraryItem): LibraryState {
  return item.state ?? LibraryState.WANT;
}

export interface LibraryGroup {
  state: LibraryState;
  label: string;
  items: LibraryItem[];
}

export function groupByState(items: LibraryItem[]): LibraryGroup[] {
  return LIBRARY_STATE_ORDER.map((state) => ({
    state,
    label: LIBRARY_STATE_LABEL[state],
    items: items.filter((item) => stateOf(item) === state),
  }));
}

export function useLibrary() {
  const { store } = useCadernoService();
  const items = useLiveQuery<LibraryItem[]>(
    ["library"],
    () => store.library.list(),
    [],
  );
  const groups = computed(() => groupByState(items.value));
  return { items, groups };
}
