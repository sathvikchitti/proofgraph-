import { screen } from "@testing-library/react";
import { renderUI } from "../../test/utils";
import { Meter } from "./meter";

const thresholds = [{ at: 0, tone: "danger" as const }, { at: 40, tone: "warning" as const }, { at: 70, tone: "success" as const }];

describe("Meter", () => {
  it("exposes meter semantics", () => {
    renderUI(<Meter label="Readiness" value={64} />);
    const m = screen.getByRole("meter", { name: "Readiness" });
    expect(m).toHaveAttribute("aria-valuenow", "64");
    expect(m).toHaveAttribute("aria-valuemin", "0");
    expect(m).toHaveAttribute("aria-valuemax", "100");
    expect(m).toHaveAttribute("aria-valuetext", "64 / 100");
  });
  it("picks the tone from thresholds", () => {
    const { container, rerender } = renderUI(<Meter label="A" value={20} thresholds={thresholds} />);
    expect(container.firstElementChild).toHaveAttribute("data-tone", "danger");
    rerender(<Meter label="A" value={55} thresholds={thresholds} />);
    expect(container.firstElementChild).toHaveAttribute("data-tone", "warning");
    rerender(<Meter label="A" value={90} thresholds={thresholds} />);
    expect(container.firstElementChild).toHaveAttribute("data-tone", "success");
  });
  it("shows a cap marker and mentions it in the value text", () => {
    renderUI(<Meter label="Honesty" value={64} cap={70} />);
    expect(screen.getByText("Cap 70")).toBeInTheDocument();
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuetext", expect.stringContaining("cap 70"));
  });
  it("clamps the fill and supports radial", () => {
    const { container } = renderUI(<Meter variant="radial" value={150} label="R" />);
    expect(screen.getByRole("meter", { name: "R" })).toBeInTheDocument();
    expect(container.querySelector("circle[stroke-dasharray]")).toHaveAttribute("stroke-dasharray", "100 100");
  });
});
