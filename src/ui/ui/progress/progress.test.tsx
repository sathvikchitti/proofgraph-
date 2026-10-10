import { screen } from "@testing-library/react";
import { renderUI } from "../../test/utils";
import { Progress } from "./progress";

describe("Progress", () => {
  it("exposes value and a formatted readout", () => {
    renderUI(<Progress value={42} label="Scan" showValue />);
    const bar = screen.getByRole("progressbar", { name: "Scan" });
    expect(bar).toHaveAttribute("aria-valuenow", "42");
    expect(screen.getByText("42%")).toBeInTheDocument();
  });
  it("is indeterminate without a value", () => {
    renderUI(<Progress aria-label="Working" />);
    const bar = screen.getByRole("progressbar", { name: "Working" });
    expect(bar).not.toHaveAttribute("aria-valuenow");
    expect(bar).toHaveAttribute("data-state", "indeterminate");
  });
  it("clamps overflow", () => {
    renderUI(<Progress value={250} aria-label="Over" />);
    expect(screen.getByRole("progressbar").firstElementChild).toHaveStyle({ transform: "translateX(-0%)" });
  });
});
