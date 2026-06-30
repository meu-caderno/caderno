import type { Assessment, DayIso, Id, Term } from "../domain";
import * as numeric from "./math";

export function weightTotal(assessments: readonly Assessment[]): number {
  return numeric.sum(assessments.map((assessment) => assessment.weight));
}

export function weightsBalanced(
  assessments: readonly Assessment[],
  tolerance = 0.001,
): boolean {
  if (assessments.length === 0) return true;
  return Math.abs(numeric.subtract(weightTotal(assessments), 1)) <= tolerance;
}

type DatedTerm = Term & { start: DayIso; end: DayIso };

export function overlappingTerms(terms: readonly Term[]): [Term, Term][] {
  const dated = terms.filter(
    (term): term is DatedTerm =>
      term.start !== undefined && term.end !== undefined,
  );
  const pairs: [Term, Term][] = [];
  for (let firstIndex = 0; firstIndex < dated.length; firstIndex += 1) {
    for (
      let secondIndex = firstIndex + 1;
      secondIndex < dated.length;
      secondIndex += 1
    ) {
      const firstTerm = dated[firstIndex];
      const secondTerm = dated[secondIndex];
      if (
        firstTerm &&
        secondTerm &&
        firstTerm.start <= secondTerm.end &&
        secondTerm.start <= firstTerm.end
      )
        pairs.push([firstTerm, secondTerm]);
    }
  }
  return pairs;
}

export interface DirectedEdge {
  from: Id;
  to: Id;
}

function buildAdjacency(edges: readonly DirectedEdge[]): Map<Id, Id[]> {
  const adjacency = new Map<Id, Id[]>();
  for (const edge of edges) {
    const targets = adjacency.get(edge.from) ?? [];
    targets.push(edge.to);
    adjacency.set(edge.from, targets);
  }
  return adjacency;
}

function reachable(adjacency: Map<Id, Id[]>, source: Id, target: Id): boolean {
  const seen = new Set<Id>();
  const stack: Id[] = [source];
  while (stack.length > 0) {
    const node = stack.pop();
    if (node === undefined) break;
    if (node === target) return true;
    if (seen.has(node)) continue;
    seen.add(node);
    for (const next of adjacency.get(node) ?? []) stack.push(next);
  }
  return false;
}

export function createsCycle(
  edges: readonly DirectedEdge[],
  from: Id,
  to: Id,
): boolean {
  if (from === to) return true;
  return reachable(buildAdjacency(edges), to, from);
}
