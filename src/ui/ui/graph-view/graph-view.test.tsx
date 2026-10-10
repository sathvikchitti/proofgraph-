import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../test/utils";
import { GraphView } from "./graph-view";

const nodes = [
  { id: "a", label: "Claim A", type: "claim" },
  { id: "b", label: "Source B", type: "source" },
  { id: "c", label: "Source C", type: "source" },
];
const edges = [{ source: "a", target: "b" }, { source: "a", target: "c" }];
const styleMap = { nodes: { claim: { tone: "info" as const, label: "Claims" }, source: { tone: "success" as const } } };

// jsdom has no 2d canvas; cytoscape only needs a context that accepts every call.
beforeAll(() => {
  const ctx = new Proxy({} as Record<string, unknown>, {
    get: (t, k) => (k in t ? t[k as string] : k === "measureText" ? () => ({ width: 10 }) : k === "getImageData" ? () => ({ data: [20, 30, 40, 255] }) : k === "canvas" ? document.createElement("canvas") : () => ctx),
    set: (t, k, v) => ((t[k as string] = v), true),
  });
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation((() => ctx) as never);
});

describe("GraphView", () => {
  it("lists nodes for screen readers with connection counts and selects via button", async () => {
    const onSelect = vi.fn();
    renderUI(<GraphView nodes={nodes} edges={edges} styleMap={styleMap} onSelect={onSelect} />);
    const btn = screen.getByRole("button", { name: "Claim A, 2 connections" });
    expect(screen.getByRole("button", { name: "Source B, 1 connection" })).toBeInTheDocument();
    await userEvent.click(btn);
    expect(onSelect).toHaveBeenCalledWith("a");
    expect(btn).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Selected: Claim A")).toBeInTheDocument();
  });

  it("moves the selection with arrow keys, activates with Enter and clears with Escape", async () => {
    const onSelect = vi.fn();
    const onActivate = vi.fn();
    renderUI(<GraphView nodes={nodes} edges={edges} onSelect={onSelect} onActivate={onActivate} />);
    screen.getByRole("group").focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onSelect).toHaveBeenLastCalledWith("a");
    await userEvent.keyboard("{ArrowRight}");
    expect(onSelect).toHaveBeenLastCalledWith("b");
    await userEvent.keyboard("{Enter}");
    expect(onActivate).toHaveBeenCalledWith("b");
    await userEvent.keyboard("{Escape}");
    expect(onSelect).toHaveBeenLastCalledWith(null);
  });

  it("renders controls, and a legend built from the node types", () => {
    renderUI(<GraphView nodes={nodes} edges={edges} styleMap={styleMap} legend />);
    for (const n of ["Zoom in", "Zoom out", "Fit graph to view", "Re-run layout"]) expect(screen.getByRole("button", { name: n })).toBeInTheDocument();
    expect(screen.getByText("Claims")).toBeInTheDocument();
    expect(screen.getByText("source")).toBeInTheDocument();
  });

  it("hides controls when disabled", () => {
    renderUI(<GraphView nodes={nodes} edges={edges} controls={false} />);
    expect(screen.queryByRole("button", { name: "Zoom in" })).toBeNull();
  });

  it("shows an empty state and a loading state without a canvas", () => {
    const { rerender } = renderUI(<GraphView nodes={[]} edges={[]} />);
    expect(screen.getByText("Nothing to show yet.")).toBeInTheDocument();
    expect(screen.queryByTestId("graph-canvas")).toBeNull();
    rerender(<GraphView nodes={nodes} edges={edges} loading />);
    expect(screen.getByRole("group")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Loading graph")).toBeInTheDocument();
  });
});
