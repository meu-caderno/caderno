import type { Edge, Id, Node } from "@meu-caderno/core";
import { children } from "@meu-caderno/core";

export interface NoteLink {
  edge: Edge;
  target: Node;
  outgoing: boolean;
}

export function useNotebook() {
  const { store } = useCadernoService();
  const nodes = useLiveQuery<Node[]>(
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

  function childrenOf(id: Id): Node[] {
    return children(nodes.value, id);
  }

  function linksOf(id: Id): NoteLink[] {
    const byId = new Map(nodes.value.map((node) => [node.id, node]));
    const result: NoteLink[] = [];
    for (const edge of edges.value) {
      if (edge.from === id) {
        const target = byId.get(edge.to);
        if (target) result.push({ edge, target, outgoing: true });
      } else if (edge.to === id) {
        const target = byId.get(edge.from);
        if (target) result.push({ edge, target, outgoing: false });
      }
    }
    return result;
  }

  return { nodes, edges, roots, childrenOf, linksOf };
}
