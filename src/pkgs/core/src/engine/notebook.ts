import type { Aspect, Edge, EdgeKind, Id, Node } from "../domain";

export function children(nodes: ReadonlyArray<Node>, parentId: Id): Node[] {
  return nodes.filter((node) => node.parentId === parentId);
}

export function ancestors(nodes: ReadonlyArray<Node>, id: Id): Node[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const out: Node[] = [];
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

export function descendants(nodes: ReadonlyArray<Node>, id: Id): Node[] {
  const out: Node[] = [];
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
  nodes: ReadonlyArray<Node>,
  aspect: Aspect,
): Node[] {
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
  nodes: ReadonlyArray<Node>,
  id: Id,
  newParentId: Id,
): boolean {
  if (id === newParentId) return false;
  return !descendants(nodes, id).some((node) => node.id === newParentId);
}

export function reparent(
  nodes: ReadonlyArray<Node>,
  id: Id,
  newParentId?: Id,
): Node[] {
  if (newParentId !== undefined && !canReparent(nodes, id, newParentId)) {
    return nodes.slice();
  }
  return nodes.map((node) =>
    node.id === id ? { ...node, parentId: newParentId } : node,
  );
}

export function orphans(nodes: ReadonlyArray<Node>): Node[] {
  const ids = new Set(nodes.map((node) => node.id));
  return nodes.filter(
    (node) => node.parentId !== undefined && !ids.has(node.parentId),
  );
}

export function deOrphan(nodes: ReadonlyArray<Node>): Node[] {
  const ids = new Set(nodes.map((node) => node.id));
  return nodes.map((node) =>
    node.parentId !== undefined && !ids.has(node.parentId)
      ? { ...node, parentId: undefined }
      : node,
  );
}

export function orphanEdges(
  edges: ReadonlyArray<Edge>,
  nodes: ReadonlyArray<Node>,
): Edge[] {
  const ids = new Set(nodes.map((node) => node.id));
  return edges.filter((edge) => !ids.has(edge.from) || !ids.has(edge.to));
}
