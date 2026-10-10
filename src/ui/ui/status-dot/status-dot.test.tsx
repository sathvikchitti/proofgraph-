import { screen } from "@testing-library/react";
import { renderUI } from "../../test/utils";
import { StatusDot } from "./status-dot";

describe("StatusDot", () => {
  it("is announced only when labelled", () => {
    renderUI(<StatusDot tone="success" label="Live" />);
    expect(screen.getByRole("img", { name: "Live" })).toHaveAttribute("data-tone", "success");
  });
  it("is hidden from assistive tech without a label", () => {
    const { container } = renderUI(<StatusDot />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });
});
