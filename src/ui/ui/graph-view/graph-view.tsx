"use client";
/**
 * GraphView — cytoscape wrapper styled by tokens: nodes/edges with a `styleMap` (type → tone/shape/size),
 * built-in layouts, select, neighbour highlight, fit/zoom controls, minimap, keyboard navigation and a
 * screen-reader node list. Colors are resolved from CSS tokens at runtime (re-resolved when the theme changes).
 * Scroll-zoom is off by default so the page can scroll. Deps: react, cytoscape, lucide-react, lib/*,
 * hooks/use-controllable-state, hooks/use-media-query, hooks/use-theme, ui/skeleton, ui/empty-state.
 */
import cytoscape, { type Core, type ElementDefinition, type LayoutOptions, type StylesheetJson } from "cytoscape";
import { Maximize2, Shuffle, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "../../lib/cn";
import { readCssNumber, readCssString, resolveCssColor } from "../../lib/css-color";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, StyleProps, Tone } from "../../lib/types";
import { useControllableState } from "../../hooks/use-controllable-state";
import { useMediaQuery } from "../../hooks/use-media-query";
import { useTheme } from "../../hooks/use-theme";
import { EmptyState } from "../empty-state";
import { Skeleton } from "../skeleton";
import { graphViewRecipe } from "./graph-view.recipe";

export interface GraphNode {
  id: string;
  label?: string;
  /** Looked up in `styleMap.nodes`. */
  type?: string;
  /** Scales the node (1 = default size). */
  weight?: number;
}

export interface GraphEdge {
  id?: string;
  source: string;
  target: string;
  label?: string;
  /** Looked up in `styleMap.edges`. */
  type?: string;
}

export type NodeShape = "ellipse" | "round-rectangle" | "rectangle" | "diamond" | "hexagon" | "triangle" | "star";

export interface GraphStyleMap {
  nodes?: Record<string, { tone?: Tone; shape?: NodeShape; label?: string }>;
  edges?: Record<string, { tone?: Tone; dashed?: boolean; directed?: boolean; label?: string }>;
}

export type GraphLayout = "cose" | "grid" | "circle" | "concentric" | "breadthfirst";

export interface GraphViewLabels {
  region: string;
  zoomIn: string;
  zoomOut: string;
  fit: string;
  relayout: string;
  nodeList: string;
  connections: (n: number) => string;
  empty: string;
  loading: string;
  selected: (label: string) => string;
}

const DEFAULT_LABELS: GraphViewLabels = {
  region: "Graph. Use arrow keys to move between nodes, Enter to open, plus and minus to zoom, 0 to fit.",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  fit: "Fit graph to view",
  relayout: "Re-run layout",
  nodeList: "Graph nodes",
  connections: (n) => `${n} ${n === 1 ? "connection" : "connections"}`,
  empty: "Nothing to show yet.",
  loading: "Loading graph",
  selected: (l) => `Selected: ${l}`,
};

export interface GraphViewProps extends StyleProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  styleMap?: GraphStyleMap;
  layout?: GraphLayout;
  selectedId?: string | null;
  defaultSelectedId?: string | null;
  onSelect?: (id: string | null) => void;
  /** Double-click / Enter on a node. */
  onActivate?: (id: string) => void;
  /** Fade everything except the selected node and its neighbours (default true). */
  dimOthers?: boolean;
  controls?: boolean;
  minimap?: boolean;
  /** Legend of the node types present, using the styleMap tones. */
  legend?: boolean;
  /** Allow mouse-wheel / pinch zoom (off by default so the page keeps scrolling). */
  scrollZoom?: boolean;
  height?: number | string;
  loading?: boolean;
  labels?: Partial<GraphViewLabels>;
  classNames?: ClassNames<"root" | "controls" | "minimap">;
}

type Colors = ReturnType<typeof readColors>;
const TONES: Tone[] = ["neutral", "info", "success", "warning", "danger"];

function readColors(el: Element) {
  const c = (v: string) => resolveCssColor(el, `var(${v})`);
  return {
    fg: c("--fg"),
    muted: c("--fg-muted"),
    border: c("--border-strong"),
    surface: c("--bg-raised"),
    accent: c("--accent"),
    ring: c("--ring"),
    tone: Object.fromEntries(TONES.map((t) => [t, c(`--${t}`)])) as Record<Tone, string>,
    font: readCssString(el, "--font-ui", "sans-serif"),
    nodeSize: readCssNumber(el, "--graph-node-size", 30),
    edgeWidth: readCssNumber(el, "--graph-edge-width", 1.5),
    fontSize: readCssNumber(el, "--graph-font-size", 11),
  };
}

function buildStyle(k: Colors): StylesheetJson {
  return [
    {
      selector: "node",
      style: {
        label: "data(label)",
        width: "data(size)",
        height: "data(size)",
        "background-color": "data(color)",
        shape: "data(shape)" as never,
        "border-width": 2,
        "border-color": k.surface,
        color: k.fg,
        "font-family": k.font,
        "font-size": k.fontSize,
        "text-valign": "bottom",
        "text-margin-y": 6,
        "text-wrap": "ellipsis",
        "text-max-width": "90px",
        "min-zoomed-font-size": 6,
      },
    },
    { selector: "node:selected", style: { "border-width": 4, "border-color": k.ring, "overlay-opacity": 0 } },
    {
      selector: "edge",
      style: {
        width: k.edgeWidth,
        "line-color": "data(color)",
        "line-style": "data(lineStyle)" as never,
        "curve-style": "bezier",
        "target-arrow-shape": "data(arrow)" as never,
        "target-arrow-color": "data(color)",
        "arrow-scale": 0.9,
        label: "data(label)",
        "font-size": k.fontSize - 1,
        color: k.muted,
        "font-family": k.font,
        "text-background-color": k.surface,
        "text-background-opacity": 1,
        "text-background-padding": "2px",
        "text-rotation": "autorotate",
      },
    },
    { selector: ".dim", style: { opacity: 0.22 } },
    { selector: "edge:selected", style: { width: k.edgeWidth * 2 } },
  ];
}

function toElements(nodes: GraphNode[], edges: GraphEdge[], map: GraphStyleMap | undefined, k: Colors): ElementDefinition[] {
  const ids = new Set(nodes.map((n) => n.id));
  const out: ElementDefinition[] = nodes.map((n) => {
    const s = (n.type && map?.nodes?.[n.type]) || {};
    return {
      group: "nodes",
      data: { id: n.id, label: n.label ?? n.id, type: n.type ?? "", color: k.tone[s.tone ?? "neutral"], shape: s.shape ?? "ellipse", size: Math.round(k.nodeSize * (n.weight ?? 1)) },
    };
  });
  edges.forEach((e, i) => {
    if (!ids.has(e.source) || !ids.has(e.target)) return;
    const s = (e.type && map?.edges?.[e.type]) || {};
    out.push({
      group: "edges",
      data: { id: e.id ?? `e${i}:${e.source}>${e.target}`, source: e.source, target: e.target, label: e.label ?? "", color: s.tone ? k.tone[s.tone] : k.border, lineStyle: s.dashed ? "dashed" : "solid", arrow: s.directed ? "triangle" : "none" },
    });
  });
  return out;
}

function layoutOptions(name: GraphLayout, animate: boolean): LayoutOptions {
  return { name, animate, animationDuration: 300, fit: true, padding: 24, nodeDimensionsIncludeLabels: true, ...(name === "breadthfirst" ? { directed: true, spacingFactor: 1.1 } : {}) } as LayoutOptions;
}

export function GraphView({
  nodes,
  edges,
  styleMap,
  layout = "cose",
  selectedId,
  defaultSelectedId = null,
  onSelect,
  onActivate,
  dimOthers = true,
  controls = true,
  minimap = false,
  legend = false,
  scrollZoom = false,
  height = 420,
  loading = false,
  labels: labelOverrides,
  className,
  classNames,
}: GraphViewProps) {
  const r = useRecipe("graphView", graphViewRecipe);
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const wrapper = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const colorsRef = useRef<Colors | null>(null);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const { resolvedTheme } = useTheme();
  const [themeTick, setThemeTick] = useState(0);
  const [selected, setSelected] = useControllableState<string | null>({ value: selectedId, defaultValue: defaultSelectedId, onChange: onSelect });
  const selectRef = useRef(setSelected);
  selectRef.current = setSelected;
  const activateRef = useRef(onActivate);
  activateRef.current = onActivate;
  const [mini, setMini] = useState<{ nodes: { x: number; y: number; id: string }[]; box: { x1: number; y1: number; w: number; h: number }; view: { x1: number; y1: number; w: number; h: number } } | null>(null);

  const latest = useRef({ nodes, edges, styleMap });
  latest.current = { nodes, edges, styleMap };
  const empty = nodes.length === 0;
  const structure = useMemo(() => JSON.stringify([nodes.map((n) => [n.id, n.label, n.type, n.weight]), edges.map((e) => [e.id, e.source, e.target, e.label, e.type]), styleMap]), [nodes, edges, styleMap]);

  // theme / skin / density changes → re-resolve token colors
  useEffect(() => {
    const mo = new MutationObserver(() => setThemeTick((t) => t + 1));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-skin", "data-density"] });
    return () => mo.disconnect();
  }, []);

  const syncMini = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;
    const bb = cy.elements().boundingBox();
    const ext = cy.extent();
    setMini({
      nodes: cy.nodes().map((n) => ({ id: n.id(), x: n.position("x"), y: n.position("y") })),
      box: { x1: Math.min(bb.x1, ext.x1), y1: Math.min(bb.y1, ext.y1), w: Math.max(bb.x2, ext.x2) - Math.min(bb.x1, ext.x1), h: Math.max(bb.y2, ext.y2) - Math.min(bb.y1, ext.y1) },
      view: { x1: ext.x1, y1: ext.y1, w: ext.w, h: ext.h },
    });
  }, []);

  // create / update the cytoscape instance
  useEffect(() => {
    const el = canvas.current;
    if (!el || empty || loading) return;
    const k = readColors(el);
    colorsRef.current = k;
    let cy = cyRef.current;
    const fresh = !cy;
    if (!cy) {
      cy = cytoscape({ container: el, elements: [], style: buildStyle(k), minZoom: 0.2, maxZoom: 3, wheelSensitivity: 0.3, userZoomingEnabled: scrollZoom, boxSelectionEnabled: false, autoungrabify: false, selectionType: "single" });
      cyRef.current = cy;
      cy.on("tap", "node", (e) => selectRef.current(e.target.id()));
      cy.on("tap", (e) => {
        if (e.target === cy) selectRef.current(null);
      });
      cy.on("dbltap", "node", (e) => activateRef.current?.(e.target.id()));
      cy.on("render viewport position layoutstop", () => requestAnimationFrame(syncMini));
    } else {
      cy.style(buildStyle(k));
    }
    cy.userZoomingEnabled(scrollZoom);
    const els = toElements(latest.current.nodes, latest.current.edges, latest.current.styleMap, k);
    const sameStructure = !fresh && cy.scratch("_structure") === structure;
    if (sameStructure) {
      // theme-only refresh: keep positions, restyle data
      cy.batch(() => els.forEach((d) => cy!.getElementById(String(d.data.id)).data(d.data)));
    } else {
      cy.batch(() => {
        cy!.elements().remove();
        cy!.add(els);
      });
      cy.scratch("_structure", structure);
      cy.layout(layoutOptions(layout, !reduced && !fresh)).run();
    }
    cy.resize();
    syncMini();
  }, [structure, layout, empty, loading, scrollZoom, themeTick, resolvedTheme, reduced, syncMini]);

  // destroy on unmount (or when the graph is replaced by a state)
  useEffect(() => {
    if (!empty && !loading) return;
    cyRef.current?.destroy();
    cyRef.current = null;
  }, [empty, loading]);
  useEffect(
    () => () => {
      cyRef.current?.destroy();
      cyRef.current = null;
    },
    [],
  );

  // keep the canvas sized with its container
  useEffect(() => {
    const el = wrapper.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => cyRef.current?.resize());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // selection → cytoscape (+ neighbour highlight)
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.batch(() => {
      cy.elements().unselect().removeClass("dim");
      if (selected) {
        const n = cy.getElementById(selected);
        if (n.length) {
          n.select();
          if (dimOthers) cy.elements().not(n.closedNeighborhood()).addClass("dim");
        }
      }
    });
  }, [selected, dimOthers, structure, themeTick]);

  const zoomBy = (factor: number) => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.zoom({ level: cy.zoom() * factor, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
  };
  const fit = () => cyRef.current?.fit(undefined, 24);
  const relayout = () => cyRef.current?.layout(layoutOptions(layout, !reduced)).run();
  const select = (id: string | null) => setSelected(id);

  const order = nodes.map((n) => n.id);
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.target !== e.currentTarget && (e.target as HTMLElement).tagName === "BUTTON") return;
    const i = selected ? order.indexOf(selected) : -1;
    const move = (d: number) => order.length && select(order[(i + d + order.length) % order.length] ?? null);
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        move(1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        move(-1);
        break;
      case "Enter":
        if (selected) activateRef.current?.(selected);
        break;
      case "Escape":
        select(null);
        break;
      case "+":
      case "=":
        zoomBy(1.25);
        break;
      case "-":
        zoomBy(0.8);
        break;
      case "0":
        fit();
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  const degree = useMemo(() => {
    const d = new Map<string, number>();
    edges.forEach((e) => {
      d.set(e.source, (d.get(e.source) ?? 0) + 1);
      d.set(e.target, (d.get(e.target) ?? 0) + 1);
    });
    return d;
  }, [edges]);

  const legendItems = useMemo(() => {
    if (!legend) return [];
    const seen = new Map<string, Tone>();
    nodes.forEach((n) => {
      if (n.type && !seen.has(n.type)) seen.set(n.type, styleMap?.nodes?.[n.type]?.tone ?? "neutral");
    });
    return [...seen].map(([type, tone]) => ({ type, label: styleMap?.nodes?.[type]?.label ?? type, tone }));
  }, [legend, nodes, styleMap]);

  const selectedLabel = selected ? (nodes.find((n) => n.id === selected)?.label ?? selected) : null;

  return (
    <div
      ref={wrapper}
      role="group"
      aria-label={labels.region}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(r.root(), className, classNames?.root)}
      style={{ height }}
      aria-busy={loading || undefined}
    >
      {loading ? (
        <div className={r.status()}>
          <Skeleton shape="rect" height="100%" width="100%" label={labels.loading} />
        </div>
      ) : empty ? (
        <div className={r.status()}>
          <EmptyState size="sm" title={labels.empty} />
        </div>
      ) : (
        <>
          <div ref={canvas} className={r.canvas()} data-testid="graph-canvas" />
          {selectedLabel ? <div className={r.selected()}>{labels.selected(selectedLabel)}</div> : null}
          {controls ? (
            <div className={cn(r.controls(), classNames?.controls)}>
              <button type="button" className={r.controlButton()} aria-label={labels.zoomIn} title={labels.zoomIn} onClick={() => zoomBy(1.25)}>
                <ZoomIn className="size-4" aria-hidden />
              </button>
              <button type="button" className={r.controlButton()} aria-label={labels.zoomOut} title={labels.zoomOut} onClick={() => zoomBy(0.8)}>
                <ZoomOut className="size-4" aria-hidden />
              </button>
              <button type="button" className={r.controlButton()} aria-label={labels.fit} title={labels.fit} onClick={fit}>
                <Maximize2 className="size-4" aria-hidden />
              </button>
              <button type="button" className={r.controlButton()} aria-label={labels.relayout} title={labels.relayout} onClick={relayout}>
                <Shuffle className="size-4" aria-hidden />
              </button>
            </div>
          ) : null}
          {minimap && mini ? (
            <svg
              aria-hidden
              className={cn(r.minimap(), classNames?.minimap)}
              width={140}
              height={96}
              viewBox={`${mini.box.x1 - 10} ${mini.box.y1 - 10} ${mini.box.w + 20} ${mini.box.h + 20}`}
              preserveAspectRatio="xMidYMid meet"
              onPointerDown={(e) => {
                const cy = cyRef.current;
                if (!cy) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const vb = e.currentTarget.viewBox.baseVal;
                const scale = Math.min(rect.width / vb.width, rect.height / vb.height);
                const mx = vb.x + (e.clientX - rect.left - (rect.width - vb.width * scale) / 2) / scale;
                const my = vb.y + (e.clientY - rect.top - (rect.height - vb.height * scale) / 2) / scale;
                const z = cy.zoom();
                cy.pan({ x: cy.width() / 2 - mx * z, y: cy.height() / 2 - my * z });
              }}
            >
              <rect x={mini.view.x1} y={mini.view.y1} width={mini.view.w} height={mini.view.h} className={r.minimapView()} />
              {mini.nodes.map((n) => (
                <circle key={n.id} cx={n.x} cy={n.y} r={Math.max(mini.box.w, mini.box.h) / 45} className={r.minimapNode()} />
              ))}
            </svg>
          ) : null}
          {legendItems.length ? (
            <ul className={r.legend()} aria-label="Legend">
              {legendItems.map((l) => (
                <li key={l.type} data-tone={l.tone} className={r.legendItem()}>
                  <span aria-hidden className={r.swatch()} style={{ background: `var(--${l.tone})` }} />
                  {l.label}
                </li>
              ))}
            </ul>
          ) : null}
          <ul className="sr-only" aria-label={labels.nodeList}>
            {nodes.map((n) => (
              <li key={n.id}>
                <button type="button" aria-pressed={selected === n.id} onClick={() => select(n.id)}>
                  {n.label ?? n.id}, {labels.connections(degree.get(n.id) ?? 0)}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
