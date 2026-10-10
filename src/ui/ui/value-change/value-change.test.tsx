import { screen } from "@testing-library/react";
import { renderUI } from "../../test/utils";
import { ValueChange } from "./value-change";

describe("ValueChange", () => {
  it("describes the change for assistive tech", () => {
    renderUI(<ValueChange from={55} to={70} />);
    expect(screen.getByText("changed from 55 to 70")).toBeInTheDocument();
  });
  it("derives tone from direction and goodDirection", () => {
    const { container, rerender } = renderUI(<ValueChange from={1} to={2} />);
    expect(container.firstElementChild).toHaveAttribute("data-tone", "success");
    rerender(<ValueChange from={1} to={2} goodDirection="down" />);
    expect(container.firstElementChild).toHaveAttribute("data-tone", "danger");
    rerender(<ValueChange from={2} to={2} />);
    expect(container.firstElementChild).toHaveAttribute("data-tone", "neutral");
  });
  it("shows a signed delta and honors an explicit tone", () => {
    const { container } = renderUI(<ValueChange from={10} to={25} showDelta tone="info" />);
    expect(container).toHaveTextContent("+15");
    expect(container.firstElementChild).toHaveAttribute("data-tone", "info");
  });
});
