import type { Edge, Id, NotebookNode } from "@meu-caderno/core";
import { children } from "@meu-caderno/core";

export interface NoteLink {
  edge: Edge;
  target: NotebookNode;
  outgoing: boolean;
}

function linkFor(
  edge: Edge,
  id: Id,
  nodesById: Map<Id, NotebookNode>,
): NoteLink | null {
  if (edge.from === id) {
    const target = nodesById.get(edge.to);
    return target ? { edge, target, outgoing: true } : null;
  }
  if (edge.to === id) {
    const target = nodesById.get(edge.from);
    return target ? { edge, target, outgoing: false } : null;
  }
  return null;
}

export function useNotebook() {
  const { store } = useCadernoService();
  const nodes = useLiveQuery<NotebookNode[]>(
    ["nodes"],
    () => store.graph.nodes.list(),
    [],
  );
  const edges = useLiveQuery<Edge[]>(
    ["edges"],
    () => store.graph.edges.list(),
    [],
  );

  const roots = computed(() =>
    nodes.value.filter((node) => node.parentId === undefined),
  );

  function childrenOf(id: Id): NotebookNode[] {
    return children(nodes.value, id);
  }

  function linksOf(id: Id): NoteLink[] {
    const nodesById = new Map(nodes.value.map((node) => [node.id, node]));
    return edges.value
      .map((edge) => linkFor(edge, id, nodesById))
      .filter((link): link is NoteLink => link !== null);
  }

  return { nodes, edges, roots, childrenOf, linksOf };
}
