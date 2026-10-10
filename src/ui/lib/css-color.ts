/**
 * Resolve CSS tokens to concrete colors for canvas libraries (cytoscape) that cannot read var().
 * Works for any CSS color the browser understands (hex, rgb, color-mix, color()). Falls back to the
 * computed string when no canvas is available (SSR, jsdom). No dependencies.
 */
let ctx: CanvasRenderingContext2D | null | undefined;

function canvas2d() {
  if (ctx !== undefined) return ctx;
  try {
    ctx = typeof document === "undefined" ? null : document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  } catch {
    ctx = null;
  }
  return ctx;
}

/** `value` may be "var(--success)", "#fff", "color-mix(...)". Resolved in the scope of `el`. */
export function resolveCssColor(el: Element, value: string): string {
  const probe = document.createElement("span");
  probe.style.color = value;
  probe.style.display = "none";
  el.appendChild(probe);
  const computed = getComputedStyle(probe).color;
  el.removeChild(probe);
  const c = canvas2d();
  if (!c || !computed) return computed || "#808080";
  c.clearRect(0, 0, 1, 1);
  c.fillStyle = "#000";
  c.fillStyle = computed;
  c.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = c.getImageData(0, 0, 1, 1).data as unknown as number[];
  return a === 255 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${+(a! / 255).toFixed(3)})`;
}

/** Read a unitless numeric token such as --graph-node-size. */
export function readCssNumber(el: Element, name: string, fallback: number): number {
  const v = parseFloat(getComputedStyle(el).getPropertyValue(name));
  return Number.isFinite(v) ? v : fallback;
}

export function readCssString(el: Element, name: string, fallback: string): string {
  return getComputedStyle(el).getPropertyValue(name).trim() || fallback;
}
