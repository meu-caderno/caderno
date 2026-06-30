import type { Edge, NotebookNode } from "@meu-caderno/core";
import { Aspect, createsCycle, EdgeKind, Mastery } from "@meu-caderno/core";
import type cytoscape from "cytoscape";
import type { Core, NodeSingular } from "cytoscape";

const NODE_FONT = "Familjen Grotesk, system-ui, sans-serif";

export interface GraphPalette {
  card: string;
  ink: string;
  inkMuted: string;
  border: string;
  ok: string;
  warn: string;
  info: string;
  purple: string;
}

type PaletteTone = keyof Omit<GraphPalette, "card" | "ink" | "border">;

interface DagreLayoutOptions {
  name: "dagre";
  rankDir: "TB" | "LR";
  nodeSep: number;
  rankSep: number;
  padding: number;
  animate: boolean;
}

const FALLBACK: GraphPalette = {
  card: "#fcfcfa",
  ink: "#2c2a27",
  inkMuted: "#6b6862",
  border: "#c4beb0",
  ok: "#2f7d4f",
  warn: "#b8862b",
  info: "#3f6fb0",
  purple: "#7a4f96",
};

export function readPalette(root: HTMLElement): GraphPalette {
  const cs = getComputedStyle(root);
  const read = (token: string, fallback: string): string =>
    cs.getPropertyValue(token).trim() || fallback;
  return {
    card: read("--pt-card", FALLBACK.card),
    ink: read("--pt-ink", FALLBACK.ink),
    inkMuted: read("--pt-ink-muted", FALLBACK.inkMuted),
    border: read("--pt-border-muted", FALLBACK.border),
    ok: read("--pt-ok", FALLBACK.ok),
    warn: read("--pt-warn", FALLBACK.warn),
    info: read("--pt-info", FALLBACK.info),
    purple: read("--pt-purple", FALLBACK.purple),
  };
}

function masteryColor(node: NotebookNode, palette: GraphPalette): string {
  const mastery = node.mastery ?? Mastery.UNKNOWN;
  if (mastery === Mastery.MASTERED) return palette.ok;
  if (mastery === Mastery.STUDYING) return palette.warn;
  return palette.inkMuted;
}

function nodeColor(node: NotebookNode, palette: GraphPalette): string {
  if (node.aspects.includes(Aspect.CONCEPT)) return masteryColor(node, palette);
  if (node.aspects.includes(Aspect.NOTE)) return palette.info;
  if (node.aspects.includes(Aspect.WORK)) return palette.purple;
  return palette.inkMuted;
}

export function toElements(
  nodes: NotebookNode[],
  edges: Edge[],
  palette: GraphPalette,
): cytoscape.ElementDefinition[] {
  const ids = new Set(nodes.map((node) => node.id));
  const nodeEls: cytoscape.ElementDefinition[] = nodes.map((node) => ({
    data: { id: node.id, label: node.title, color: nodeColor(node, palette) },
  }));
  const edgeEls: cytoscape.ElementDefinition[] = edges
    .filter((edge) => ids.has(edge.from) && ids.has(edge.to))
    .map((edge) => ({
      data: {
        id: edge.id,
        source: edge.from,
        target: edge.to,
        kind: edge.kind,
      },
    }));
  return [...nodeEls, ...edgeEls];
}

export const EDGE_KIND_STYLE: Record<
  EdgeKind,
  { line: "solid" | "dashed" | "dotted"; tone: PaletteTone }
> = {
  [EdgeKind.PART_OF]: { line: "solid", tone: "ok" },
  [EdgeKind.PREPARES]: { line: "dashed", tone: "info" },
  [EdgeKind.ASSESSES]: { line: "dotted", tone: "purple" },
  [EdgeKind.SOURCE_OF]: { line: "solid", tone: "inkMuted" },
};

function edgeKindStyle(
  kind: EdgeKind,
  palette: GraphPalette,
): cytoscape.StylesheetStyle {
  const def = EDGE_KIND_STYLE[kind];
  const color = palette[def.tone];
  return {
    selector: `edge[kind = "${kind}"]`,
    style: {
      "line-style": def.line,
      "line-color": color,
      "target-arrow-color": color,
    },
  };
}

export function styleSheet(palette: GraphPalette): cytoscape.StylesheetJson {
  const base: cytoscape.StylesheetJson = [
    {
      selector: "node",
      style: {
        "background-color": "data(color)",
        "border-width": 1.5,
        "border-color": palette.border,
        label: "data(label)",
        color: palette.ink,
        "font-family": NODE_FONT,
        "font-size": 11,
        "text-valign": "bottom",
        "text-halign": "center",
        "text-margin-y": 4,
        "text-wrap": "wrap",
        "text-max-width": "120px",
        width: 18,
        height: 18,
      },
    },
    {
      selector: "edge",
      style: {
        width: 1.5,
        "curve-style": "bezier",
        "line-color": palette.inkMuted,
        "target-arrow-color": palette.inkMuted,
        "target-arrow-shape": "triangle",
        "arrow-scale": 0.8,
      },
    },
  ];
  const kinds = Object.values(EdgeKind).map((kind) =>
    edgeKindStyle(kind, palette),
  );
  return [...base, ...kinds, ...interactiveStyles(palette)];
}

function interactiveStyles(palette: GraphPalette): cytoscape.StylesheetJson {
  return [
    { selector: ".dim", style: { opacity: 0.12 } },
    {
      selector: "node.match",
      style: { "border-width": 3, "border-color": palette.warn, opacity: 1 },
    },
    {
      selector: "node.focus",
      style: { "border-width": 3, "border-color": palette.ink, opacity: 1 },
    },
    { selector: ".hidden", style: { display: "none" } },
  ];
}

const LAYOUT: DagreLayoutOptions = {
  name: "dagre",
  rankDir: "TB",
  nodeSep: 28,
  rankSep: 44,
  padding: 16,
  animate: false,
};

export function layoutOptions(): cytoscape.LayoutOptions {
  return LAYOUT as unknown as cytoscape.LayoutOptions;
}

export const EDGE_KIND_ORDER: EdgeKind[] = [
  EdgeKind.PART_OF,
  EdgeKind.PREPARES,
  EdgeKind.ASSESSES,
  EdgeKind.SOURCE_OF,
];

export const EDGE_KIND_LABEL: Record<EdgeKind, string> = {
  [EdgeKind.PART_OF]: "parte de",
  [EdgeKind.PREPARES]: "prepara",
  [EdgeKind.ASSESSES]: "avalia",
  [EdgeKind.SOURCE_OF]: "fonte de",
};

const TONE_VAR: Record<PaletteTone, string> = {
  inkMuted: "var(--pt-ink-muted)",
  ok: "var(--pt-ok)",
  warn: "var(--pt-warn)",
  info: "var(--pt-info)",
  purple: "var(--pt-purple)",
};

export interface LegendItem {
  label: string;
  color: string;
  line?: "solid" | "dashed" | "dotted";
}

export function edgeLegend(): Array<LegendItem & { kind: EdgeKind }> {
  return EDGE_KIND_ORDER.map((kind) => {
    const def = EDGE_KIND_STYLE[kind];
    return {
      kind,
      label: EDGE_KIND_LABEL[kind],
      color: TONE_VAR[def.tone],
      line: def.line,
    };
  });
}

export const NODE_LEGEND: LegendItem[] = [
  { label: "domino", color: "var(--pt-ok)" },
  { label: "estudando", color: "var(--pt-warn)" },
  { label: "conceito a ver", color: "var(--pt-ink-muted)" },
  { label: "nota", color: "var(--pt-info)" },
  { label: "trabalho", color: "var(--pt-purple)" },
];

export type EdgeKindCounts = Record<EdgeKind, number>;

export function countEdgeKinds(edges: Edge[]): EdgeKindCounts {
  const counts: EdgeKindCounts = {
    [EdgeKind.PART_OF]: 0,
    [EdgeKind.PREPARES]: 0,
    [EdgeKind.ASSESSES]: 0,
    [EdgeKind.SOURCE_OF]: 0,
  };
  for (const edge of edges) counts[edge.kind] += 1;
  return counts;
}

function omitIndex(edges: Edge[], index: number): Edge[] {
  return edges.filter((_, position) => position !== index);
}

export function hasPrereqCycle(edges: Edge[]): boolean {
  const links = edges.filter((edge) => edge.kind === EdgeKind.PREPARES);
  return links.some((edge, index) =>
    createsCycle(omitIndex(links, index), edge.from, edge.to),
  );
}

export interface HighlightState {
  focusedId: string | null;
  search: string;
}

export function applyHighlight(cy: Core, state: HighlightState): number {
  cy.elements().removeClass("dim focus match");
  if (state.focusedId) {
    applyFocus(cy, state.focusedId);
    return 0;
  }
  return applySearch(cy, state.search);
}

function applyFocus(cy: Core, focusedId: string): void {
  const node = cy.getElementById(focusedId);
  if (node.empty()) return;
  cy.batch(() => {
    cy.elements().addClass("dim");
    node.closedNeighborhood().removeClass("dim");
    node.addClass("focus");
  });
}

function nodeMatches(node: NodeSingular, term: string): boolean {
  return String(node.data("label") ?? "")
    .toLowerCase()
    .includes(term);
}

function applySearch(cy: Core, search: string): number {
  const term = search.trim().toLowerCase();
  if (!term) return 0;
  let hits = 0;
  cy.batch(() => {
    cy.nodes().forEach((node) => {
      const matched = nodeMatches(node, term);
      node.addClass(matched ? "match" : "dim");
      if (matched) hits += 1;
    });
    cy.edges().addClass("dim");
  });
  return hits;
}

export function applyEdgeVisibility(
  cy: Core,
  hidden: ReadonlySet<EdgeKind>,
): void {
  cy.batch(() => {
    cy.edges().forEach((edge) => {
      const kind = edge.data("kind") as EdgeKind;
      edge.toggleClass("hidden", hidden.has(kind));
    });
  });
}
