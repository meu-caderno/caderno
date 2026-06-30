import type { Edge, EdgeKind, Id, NotebookNode } from "../domain";
import { Aspect, Mastery } from "../domain";

export function children(
  nodes: ReadonlyArray<NotebookNode>,
  parentId: Id,
): NotebookNode[] {
  return nodes.filter((node) => node.parentId === parentId);
}

export function ancestors(
  nodes: ReadonlyArray<NotebookNode>,
  id: Id,
): NotebookNode[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const out: NotebookNode[] = [];
  const seen = new Set<Id>();
  let parentId = byId.get(id)?.parentId;
  while (parentId !== undefined && !seen.has(parentId)) {
    seen.add(parentId);
    const parent = byId.get(parentId);
    if (!parent) break;
    out.push(parent);
    parentId = parent.parentId;
  }
  return out;
}

export function descendants(
  nodes: ReadonlyArray<NotebookNode>,
  id: Id,
): NotebookNode[] {
  const out: NotebookNode[] = [];
  const seen = new Set<Id>([id]);
  const stack: Id[] = [id];
  while (stack.length > 0) {
    const current = stack.pop();
    if (current === undefined) break;
    for (const child of nodes.filter((node) => node.parentId === current)) {
      if (!seen.has(child.id)) {
        seen.add(child.id);
        out.push(child);
        stack.push(child.id);
      }
    }
  }
  return out;
}

export function nodesByAspect(
  nodes: ReadonlyArray<NotebookNode>,
  aspect: Aspect,
): NotebookNode[] {
  return nodes.filter((node) => node.aspects.includes(aspect));
}

export function edgesFrom(edges: ReadonlyArray<Edge>, id: Id): Edge[] {
  return edges.filter((edge) => edge.from === id);
}

export function edgesTo(edges: ReadonlyArray<Edge>, id: Id): Edge[] {
  return edges.filter((edge) => edge.to === id);
}

export function edgesByKind(
  edges: ReadonlyArray<Edge>,
  kind: EdgeKind,
): Edge[] {
  return edges.filter((edge) => edge.kind === kind);
}

export function canReparent(
  nodes: ReadonlyArray<NotebookNode>,
  id: Id,
  newParentId: Id,
): boolean {
  if (id === newParentId) return false;
  return !descendants(nodes, id).some((node) => node.id === newParentId);
}

export function reparent(
  nodes: ReadonlyArray<NotebookNode>,
  id: Id,
  newParentId?: Id,
): NotebookNode[] {
  if (newParentId !== undefined && !canReparent(nodes, id, newParentId)) {
    return nodes.slice();
  }
  return nodes.map((node) =>
    node.id === id ? { ...node, parentId: newParentId } : node,
  );
}

export function orphans(nodes: ReadonlyArray<NotebookNode>): NotebookNode[] {
  const ids = new Set(nodes.map((node) => node.id));
  return nodes.filter(
    (node) => node.parentId !== undefined && !ids.has(node.parentId),
  );
}

export function deOrphan(nodes: ReadonlyArray<NotebookNode>): NotebookNode[] {
  const ids = new Set(nodes.map((node) => node.id));
  return nodes.map((node) =>
    node.parentId !== undefined && !ids.has(node.parentId)
      ? { ...node, parentId: undefined }
      : node,
  );
}

export function orphanEdges(
  edges: ReadonlyArray<Edge>,
  nodes: ReadonlyArray<NotebookNode>,
): Edge[] {
  const ids = new Set(nodes.map((node) => node.id));
  return edges.filter((edge) => !ids.has(edge.from) || !ids.has(edge.to));
}

const REVIEW_RANK: Partial<Record<Mastery, number>> = {
  [Mastery.UNKNOWN]: 0,
  [Mastery.STUDYING]: 1,
};

function reviewRank(node: NotebookNode): number | undefined {
  return REVIEW_RANK[node.mastery ?? Mastery.UNKNOWN];
}

/**
 * Pure review queue: concepts not yet mastered (UNKNOWN or STUDYING),
 * ordered with UNKNOWN before STUDYING. No clock/random — engine purity.
 */
export function reviewQueue(
  nodes: ReadonlyArray<NotebookNode>,
): NotebookNode[] {
  return nodes
    .filter(
      (node) =>
        node.aspects.includes(Aspect.CONCEPT) && reviewRank(node) !== undefined,
    )
    .sort((a, b) => (reviewRank(a) ?? 0) - (reviewRank(b) ?? 0));
}
