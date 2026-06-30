import type { Edge, Id, NotebookNode } from "@meu-caderno/core";
import { EdgeKind } from "@meu-caderno/core";

export interface MapCoverage {
  refed: number;
  total: number;
  pct: number;
}

export function coverage(
  refIds: readonly Id[],
  conceptIds: readonly Id[],
): MapCoverage {
  const total = conceptIds.length;
  const refSet = new Set(refIds);
  const refed = conceptIds.filter((id) => refSet.has(id)).length;
  const pct = total === 0 ? 0 : Math.round((refed / total) * 100);
  return { refed, total, pct };
}

export function prereqsOf(nodeId: Id, edges: readonly Edge[]): Id[] {
  return edges
    .filter((edge) => edge.kind === EdgeKind.PREPARES && edge.to === nodeId)
    .map((edge) => edge.from);
}

interface TopoState {
  inSet: Set<Id>;
  byId: Map<Id, NotebookNode>;
  edges: readonly Edge[];
  visited: Set<Id>;
  onStack: Set<Id>;
  result: NotebookNode[];
  cyclic: boolean;
}

function topoVisit(node: NotebookNode, state: TopoState): void {
  if (state.visited.has(node.id)) return;
  if (state.onStack.has(node.id)) {
    state.cyclic = true;
    return;
  }
  state.onStack.add(node.id);
  for (const prereq of prereqsOf(node.id, state.edges)) {
    const dep = state.inSet.has(prereq) ? state.byId.get(prereq) : undefined;
    if (dep) topoVisit(dep, state);
  }
  state.onStack.delete(node.id);
  state.visited.add(node.id);
  state.result.push(node);
}

export function topologicalOrder(
  concepts: readonly NotebookNode[],
  edges: readonly Edge[],
): NotebookNode[] {
  const state: TopoState = {
    inSet: new Set(concepts.map((concept) => concept.id)),
    byId: new Map(concepts.map((concept) => [concept.id, concept])),
    edges,
    visited: new Set(),
    onStack: new Set(),
    result: [],
    cyclic: false,
  };
  for (const concept of concepts) topoVisit(concept, state);
  return state.cyclic ? [...concepts] : state.result;
}
