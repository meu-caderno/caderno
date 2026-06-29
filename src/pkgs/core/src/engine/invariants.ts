import type { Assessment, DayIso, Id, Term } from "../domain";
import * as num from "./math";

export function weightTotal(assessments: readonly Assessment[]): number {
  return num.sum(assessments.map((assessment) => assessment.weight));
}

export function weightsBalanced(
  assessments: readonly Assessment[],
  tolerance = 0.001,
): boolean {
  if (assessments.length === 0) return true;
  return Math.abs(num.subtract(weightTotal(assessments), 1)) <= tolerance;
}

type DatedTerm = Term & { start: DayIso; end: DayIso };

export function overlappingTerms(terms: readonly Term[]): [Term, Term][] {
  const dated = terms.filter(
    (term): term is DatedTerm =>
      term.start !== undefined && term.end !== undefined,
  );
  const pairs: [Term, Term][] = [];
  for (let i = 0; i < dated.length; i += 1) {
    for (let j = i + 1; j < dated.length; j += 1) {
      const a = dated[i];
      const b = dated[j];
      if (a && b && a.start <= b.end && b.start <= a.end) pairs.push([a, b]);
    }
  }
  return pairs;
}

export interface DirectedEdge {
  from: Id;
  to: Id;
}

export function createsCycle(
  edges: readonly DirectedEdge[],
  from: Id,
  to: Id,
): boolean {
  if (from === to) return true;
  const adjacency = new Map<Id, Id[]>();
  for (const edge of edges) {
    const targets = adjacency.get(edge.from) ?? [];
    targets.push(edge.to);
    adjacency.set(edge.from, targets);
  }
  const seen = new Set<Id>();
  const stack: Id[] = [to];
  while (stack.length > 0) {
    const node = stack.pop();
    if (node === undefined) break;
    if (node === from) return true;
    if (seen.has(node)) continue;
    seen.add(node);
    for (const next of adjacency.get(node) ?? []) stack.push(next);
  }
  return false;
}
