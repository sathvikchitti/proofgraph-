import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../test/utils";
import { SplitView } from "./split-view";

const handle = () => screen.getByRole("separator", { name: "Resize panel" });
const setup = (props = {}) => renderUI(<SplitView primary={<p>main</p>} secondary={<p>side</p>} defaultSize={300} minSize={200} maxSize={400} {...props} />);

describe("SplitView", () => {
  beforeEach(() => localStorage.clear());

  it("renders both panes and an accessible separator", () => {
    setup();
    expect(screen.getByText("main")).toBeInTheDocument();
    expect(screen.getByText("side")).toBeInTheDocument();
    expect(handle()).toHaveAttribute("aria-valuenow", "300");
    expect(handle()).toHaveAttribute("aria-valuemin", "200");
    expect(handle()).toHaveAttribute("aria-valuemax", "400");
  });
  it("resizes with the keyboard and clamps", async () => {
    const onSizeChange = vi.fn();
    setup({ onSizeChange });
    handle().focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(handle()).toHaveAttribute("aria-valuenow", "316"); // side=right: ArrowLeft grows the panel
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    expect(handle()).toHaveAttribute("aria-valuenow", "284");
    await userEvent.keyboard("{End}");
    expect(handle()).toHaveAttribute("aria-valuenow", "400");
    await userEvent.keyboard("{Home}");
    expect(handle()).toHaveAttribute("aria-valuenow", "200");
    expect(onSizeChange).toHaveBeenCalledWith(200);
  });
  it("mirrors keys for a left panel", async () => {
    setup({ side: "left" });
    handle().focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(handle()).toHaveAttribute("aria-valuenow", "316");
  });
  it("resizes by dragging", () => {
    const { container } = setup();
    const root = container.firstElementChild as HTMLElement;
    root.getBoundingClientRect = () => ({ left: 0, right: 1000, top: 0, bottom: 100, width: 1000, height: 100, x: 0, y: 0, toJSON: () => ({}) });
    fireEvent.pointerDown(handle(), { pointerId: 1, clientX: 700 });
    fireEvent.pointerMove(handle(), { pointerId: 1, clientX: 650 });
    expect(handle()).toHaveAttribute("aria-valuenow", "350");
    fireEvent.pointerMove(handle(), { pointerId: 1, clientX: 100 });
    expect(handle()).toHaveAttribute("aria-valuenow", "400");
    fireEvent.pointerUp(handle(), { pointerId: 1 });
    fireEvent.pointerMove(handle(), { pointerId: 1, clientX: 900 });
    expect(handle()).toHaveAttribute("aria-valuenow", "400"); // no drag after release
  });
  it("persists the size", async () => {
    const { unmount } = setup({ persistKey: "sv" });
    handle().focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(JSON.parse(localStorage.getItem("sv")!)).toBe(316);
    unmount();
    setup({ persistKey: "sv" });
    expect(handle()).toHaveAttribute("aria-valuenow", "316");
  });
  it("is controlled when size is passed", async () => {
    const onSizeChange = vi.fn();
    setup({ size: 250, onSizeChange });
    handle().focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(onSizeChange).toHaveBeenCalledWith(266);
    expect(handle()).toHaveAttribute("aria-valuenow", "250");
  });
});
