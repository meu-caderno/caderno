import type { LibraryItem } from "@meu-caderno/core";
import { LibraryKind, LibraryState } from "@meu-caderno/core";

export const LIBRARY_STATE_LABEL: Record<LibraryState, string> = {
  [LibraryState.WANT]: "Quero",
  [LibraryState.CONSUMING]: "Consumindo",
  [LibraryState.DONE]: "Concluído",
};

export const LIBRARY_KIND_ICON: Record<LibraryKind, string> = {
  [LibraryKind.BOOK]: "📕",
  [LibraryKind.ARTICLE]: "📰",
  [LibraryKind.VIDEO]: "🎬",
  [LibraryKind.SERIES]: "📺",
  [LibraryKind.COURSE]: "🎓",
  [LibraryKind.OTHER]: "📦",
};

export const LIBRARY_KIND_LABEL: Record<LibraryKind, string> = {
  [LibraryKind.BOOK]: "Livro",
  [LibraryKind.ARTICLE]: "Artigo",
  [LibraryKind.VIDEO]: "Vídeo",
  [LibraryKind.SERIES]: "Série",
  [LibraryKind.COURSE]: "Curso",
  [LibraryKind.OTHER]: "Outro",
};

export const LIBRARY_KIND_ORDER: LibraryKind[] = [
  LibraryKind.BOOK,
  LibraryKind.ARTICLE,
  LibraryKind.VIDEO,
  LibraryKind.SERIES,
  LibraryKind.COURSE,
  LibraryKind.OTHER,
];

export const LIBRARY_KIND_OPTIONS = LIBRARY_KIND_ORDER.map((kind) => ({
  value: kind,
  label: `${LIBRARY_KIND_ICON[kind]} ${LIBRARY_KIND_LABEL[kind]}`,
}));

export function kindIconOf(item: LibraryItem): string | null {
  return item.kind ? LIBRARY_KIND_ICON[item.kind] : null;
}

export function filterByKind(
  items: LibraryItem[],
  kind: LibraryKind | null,
): LibraryItem[] {
  if (!kind) return items;
  return items.filter((item) => item.kind === kind);
}

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
