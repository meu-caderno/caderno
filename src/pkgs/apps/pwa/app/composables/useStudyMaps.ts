import type { Id, MapItem, NotebookNode, StudyMap } from "@meu-caderno/core";
import { MapItemKind } from "@meu-caderno/core";

export const MAP_ITEM_KIND_LABEL: Record<MapItemKind, string> = {
  [MapItemKind.SECTION]: "Seção",
  [MapItemKind.REF]: "Conceito",
};

export function sectionItem(label: string): MapItem {
  return { kind: MapItemKind.SECTION, label };
}

export function refItem(nodeId: Id, label?: string): MapItem {
  return { kind: MapItemKind.REF, nodeId, label };
}

export function moveItem(
  items: MapItem[],
  index: number,
  direction: -1 | 1,
): MapItem[] {
  const target = index + direction;
  if (index < 0 || target < 0 || target >= items.length) return items;
  const next = [...items];
  const [moved] = next.splice(index, 1);
  next.splice(target, 0, moved as MapItem);
  return next;
}

export function removeItemAt(items: MapItem[], index: number): MapItem[] {
  if (index < 0 || index >= items.length) return items;
  return items.filter((_, position) => position !== index);
}

export function itemLabel(
  item: MapItem,
  nodesById: Map<Id, NotebookNode>,
): string {
  if (item.kind === MapItemKind.REF && item.nodeId) {
    return (
      nodesById.get(item.nodeId)?.title ?? item.label ?? "Conceito removido"
    );
  }
  return item.label ?? "Seção sem título";
}

export function useStudyMaps() {
  const { store } = useCadernoService();
  const maps = useLiveQuery<StudyMap[]>(["maps"], () => store.maps.list(), []);
  const sorted = computed(() =>
    [...maps.value].sort((left, right) => left.name.localeCompare(right.name)),
  );
  return { maps, sorted };
}
