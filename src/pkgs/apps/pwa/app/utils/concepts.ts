import type { Node } from "@meu-caderno/core";
import { Aspect, Mastery } from "@meu-caderno/core";

export function concepts(nodes: Node[]): Node[] {
  return nodes.filter((node) => node.aspects.includes(Aspect.CONCEPT));
}

export function masteryOf(node: Node): Mastery {
  return node.mastery ?? Mastery.UNKNOWN;
}

export const MASTERY_LABEL: Record<Mastery, string> = {
  [Mastery.UNKNOWN]: "não sei",
  [Mastery.STUDYING]: "estudando",
  [Mastery.MASTERED]: "domino",
};

export const MASTERY_COLOR: Record<Mastery, string> = {
  [Mastery.UNKNOWN]: "var(--pt-ink-muted)",
  [Mastery.STUDYING]: "var(--pt-warn)",
  [Mastery.MASTERED]: "var(--pt-ok)",
};

const MASTERY_CYCLE: Record<Mastery, Mastery> = {
  [Mastery.UNKNOWN]: Mastery.STUDYING,
  [Mastery.STUDYING]: Mastery.MASTERED,
  [Mastery.MASTERED]: Mastery.UNKNOWN,
};

export function nextMastery(current?: Mastery): Mastery {
  return MASTERY_CYCLE[current ?? Mastery.UNKNOWN];
}

export const MASTERY_ORDER: Mastery[] = [
  Mastery.UNKNOWN,
  Mastery.STUDYING,
  Mastery.MASTERED,
];

export interface MasteryGroup {
  mastery: Mastery;
  label: string;
  color: string;
  items: Node[];
}

export function groupByMastery(items: Node[]): MasteryGroup[] {
  return MASTERY_ORDER.map((mastery) => ({
    mastery,
    label: MASTERY_LABEL[mastery],
    color: MASTERY_COLOR[mastery],
    items: items.filter((node) => masteryOf(node) === mastery),
  }));
}
