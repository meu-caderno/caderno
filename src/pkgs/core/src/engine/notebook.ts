import type { Aspect, Edge, EdgeKind, Id, Node } from "../domain";

export function children(nodes: ReadonlyArray<Node>, parentId: Id): Node[] {
  return nodes.filter((n) => n.parentId === parentId);
}

export function ancestors(nodes: ReadonlyArray<Node>, id: Id): Node[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
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
    for (const child of nodes.filter((n) => n.parentId === current)) {
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
  return nodes.filter((n) => n.aspects.includes(aspect));
}

export function edgesFrom(edges: ReadonlyArray<Edge>, id: Id): Edge[] {
  return edges.filter((e) => e.from === id);
}

export function edgesTo(edges: ReadonlyArray<Edge>, id: Id): Edge[] {
  return edges.filter((e) => e.to === id);
}

export function edgesByKind(
  edges: ReadonlyArray<Edge>,
  kind: EdgeKind,
): Edge[] {
  return edges.filter((e) => e.kind === kind);
}

export function canReparent(
  nodes: ReadonlyArray<Node>,
  id: Id,
  newParentId: Id,
): boolean {
  if (id === newParentId) return false;
  return !descendants(nodes, id).some((n) => n.id === newParentId);
}

export function reparent(
  nodes: ReadonlyArray<Node>,
  id: Id,
  newParentId?: Id,
): Node[] {
  if (newParentId !== undefined && !canReparent(nodes, id, newParentId)) {
    return nodes.slice();
  }
  return nodes.map((n) => (n.id === id ? { ...n, parentId: newParentId } : n));
}

export function orphans(nodes: ReadonlyArray<Node>): Node[] {
  const ids = new Set(nodes.map((n) => n.id));
  return nodes.filter((n) => n.parentId !== undefined && !ids.has(n.parentId));
}

export function deOrphan(nodes: ReadonlyArray<Node>): Node[] {
  const ids = new Set(nodes.map((n) => n.id));
  return nodes.map((n) =>
    n.parentId !== undefined && !ids.has(n.parentId)
      ? { ...n, parentId: undefined }
      : n,
  );
}

export function orphanEdges(
  edges: ReadonlyArray<Edge>,
  nodes: ReadonlyArray<Node>,
): Edge[] {
  const ids = new Set(nodes.map((n) => n.id));
  return edges.filter((e) => !ids.has(e.from) || !ids.has(e.to));
}
