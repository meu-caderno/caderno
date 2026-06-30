import type { Edge, Node } from "@meu-caderno/core";
import { Aspect, EdgeKind, Mastery } from "@meu-caderno/core";
import type cytoscape from "cytoscape";

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

function masteryColor(node: Node, palette: GraphPalette): string {
  const mastery = node.mastery ?? Mastery.UNKNOWN;
  if (mastery === Mastery.MASTERED) return palette.ok;
  if (mastery === Mastery.STUDYING) return palette.warn;
  return palette.inkMuted;
}

function nodeColor(node: Node, palette: GraphPalette): string {
  if (node.aspects.includes(Aspect.CONCEPT)) return masteryColor(node, palette);
  if (node.aspects.includes(Aspect.NOTE)) return palette.info;
  if (node.aspects.includes(Aspect.WORK)) return palette.purple;
  return palette.inkMuted;
}

export function toElements(
  nodes: Node[],
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

const EDGE_KIND_STYLE: Record<
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
  return [...base, ...kinds];
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
