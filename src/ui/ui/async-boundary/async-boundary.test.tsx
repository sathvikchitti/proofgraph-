import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../test/utils";
import { AsyncBoundary } from "./async-boundary";

describe("AsyncBoundary", () => {
  it("shows the skeleton while loading and marks itself busy", () => {
    const { container } = renderUI(<AsyncBoundary query={{ isLoading: true }}>content</AsyncBoundary>);
    expect(screen.getByRole("status")).toHaveTextContent("Loading");
    expect(screen.queryByText("content")).toBeNull();
    expect(container.firstElementChild).toHaveAttribute("aria-busy", "true");
  });
  it("shows a custom skeleton", () => {
    renderUI(<AsyncBoundary query={{ isLoading: true }} skeleton={<p>custom</p>}>c</AsyncBoundary>);
    expect(screen.getByText("custom")).toBeInTheDocument();
  });
  it("shows the error with a working retry, and error wins over loading", async () => {
    const onRetry = vi.fn();
    renderUI(<AsyncBoundary query={{ isLoading: true, error: new Error("boom"), onRetry }}>content</AsyncBoundary>);
    expect(screen.getByRole("alert")).toHaveTextContent("boom");
    await userEvent.click(screen.getByRole("button", { name: /Try again/ }));
    expect(onRetry).toHaveBeenCalled();
  });
  it("shows empty only when an empty slot is provided", () => {
    const { rerender } = renderUI(<AsyncBoundary query={{ isLoading: false, isEmpty: true }} empty={<p>nothing</p>}>content</AsyncBoundary>);
    expect(screen.getByText("nothing")).toBeInTheDocument();
    rerender(<AsyncBoundary query={{ isLoading: false, isEmpty: true }}>content</AsyncBoundary>);
    expect(screen.getByText("content")).toBeInTheDocument();
  });
  it("keeps content visible while refetching", () => {
    const { container } = renderUI(<AsyncBoundary query={{ isLoading: false, isRefetching: true }}>content</AsyncBoundary>);
    expect(screen.getByText("content")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("aria-busy", "true");
  });
  it("supports a custom error renderer", () => {
    renderUI(<AsyncBoundary query={{ isLoading: false, error: "x" }} errorState={(e) => <p>custom {String(e)}</p>}>c</AsyncBoundary>);
    expect(screen.getByText("custom x")).toBeInTheDocument();
  });
});
