import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../test/utils";
import { CodeHeader, CodeViewer } from "./code-viewer";

const lines = Array.from({ length: 20 }, (_, i) => `line ${i + 1}`);
const rowOf = (n: number) => document.querySelector(`[data-line="${n}"]`) as HTMLElement;

describe("CodeViewer", () => {
  it("numbers lines from startLine and accepts `code`", () => {
    renderUI(<CodeViewer code={"a\nb"} startLine={41} syntax={false} />);
    expect(rowOf(41)).toHaveTextContent("41a");
    expect(rowOf(42)).toHaveTextContent("42b");
  });
  it("highlights ranges with a tone and announces them", () => {
    renderUI(<CodeViewer lines={lines} syntax={false} highlights={[{ from: 3, to: 4, tone: "success", label: "Accepted evidence" }]} />);
    expect(rowOf(3)).toHaveAttribute("data-tone", "success");
    expect(rowOf(4)).toHaveAttribute("data-highlighted", "true");
    expect(rowOf(5)).not.toHaveAttribute("data-highlighted");
    expect(rowOf(3)).toHaveTextContent("Accepted evidence:");
    expect(rowOf(4)).not.toHaveTextContent("Accepted evidence:");
  });
  it("folds distant context and expands on demand", async () => {
    renderUI(<CodeViewer lines={lines} syntax={false} contextCollapse={1} highlights={[{ from: 10, to: 10 }]} />);
    expect(rowOf(1)).toBeNull();
    expect(rowOf(9)).toBeInTheDocument();
    expect(rowOf(11)).toBeInTheDocument();
    const folds = screen.getAllByRole("button", { name: /lines? hidden/ });
    expect(folds).toHaveLength(2);
    expect(folds[0]).toHaveTextContent("8 lines hidden");
    await userEvent.click(folds[0]!);
    expect(rowOf(1)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /lines? hidden/ })).toHaveLength(1);
  });
  it("shows every line when there are no highlights even with contextCollapse", () => {
    renderUI(<CodeViewer lines={lines} syntax={false} contextCollapse={2} />);
    expect(rowOf(1)).toBeInTheDocument();
    expect(rowOf(20)).toBeInTheDocument();
  });
  it("toggles wrapping (uncontrolled) and reports it", async () => {
    const onWrapChange = vi.fn();
    renderUI(<CodeViewer lines={["x"]} syntax={false} onWrapChange={onWrapChange} />);
    const toggle = screen.getByRole("button", { name: "Wrap long lines" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(onWrapChange).toHaveBeenCalledWith(true);
    expect(rowOf(1).className).toContain("whitespace-pre-wrap");
  });
  it("renders the header with path, meta and a copy button that copies the code", async () => {
    const user = userEvent.setup();
    renderUI(<CodeViewer lines={["print(1)", "print(2)"]} syntax={false} header={<CodeHeader path="app/main.py" meta="15fedba" copy />} />);
    expect(screen.getByText("app/main.py")).toBeInTheDocument();
    expect(screen.getByText("15fedba")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Copy code" }));
    expect(await navigator.clipboard.readText()).toBe("print(1)\nprint(2)");
  });
  it("is a keyboard-focusable scroll region", () => {
    renderUI(<CodeViewer lines={["x"]} syntax={false} />);
    expect(screen.getByRole("region", { name: "Code" })).toHaveAttribute("tabindex", "0");
  });
  it("shows loading, empty and error states", () => {
    const { rerender } = renderUI(<CodeViewer loading />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading code");
    rerender(<CodeViewer lines={[]} />);
    expect(screen.getByText("No code to display.")).toBeInTheDocument();
    rerender(<CodeViewer error="404" />);
    expect(screen.getByText("404")).toBeInTheDocument();
  });
  it("lazily syntax-highlights with colors from css variables", async () => {
    renderUI(<CodeViewer lines={["def f(x):", "    return x"]} language="python" />);
    await waitFor(() => expect(rowOf(1).querySelector("span[style]")).not.toBeNull(), { timeout: 15000 });
    const styled = Array.from(rowOf(1).querySelectorAll<HTMLElement>("span[style]")).map((s) => s.getAttribute("style"));
    expect(styled.some((s) => s?.includes("var(--shiki-"))).toBe(true);
    expect(rowOf(1)).toHaveTextContent("def f(x):");
  }, 20000);
  it("falls back to plain text for an unknown language", async () => {
    renderUI(<CodeViewer lines={["hello"]} language="not-a-language" />);
    await new Promise((r) => setTimeout(r, 300));
    expect(rowOf(1)).toHaveTextContent("hello");
  });
});
