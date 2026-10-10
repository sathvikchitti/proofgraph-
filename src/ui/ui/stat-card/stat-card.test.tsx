import { screen } from "@testing-library/react";
import { renderUI } from "../../test/utils";
import { StatCard } from "./stat-card";

describe("StatCard", () => {
  it("shows label, value, unit and a signed delta with a good/bad tone", () => {
    renderUI(<StatCard label="Latency" value={182} unit="ms" delta={-8.2} deltaGood="down" deltaLabel="vs last week" />);
    expect(screen.getByText("Latency")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("182");
    expect(screen.getByText("ms")).toBeInTheDocument();
    const delta = screen.getByText(/8\.2%/);
    expect(delta).toHaveTextContent("-8.2%");
    expect(delta).toHaveAttribute("data-tone", "success");
  });
  it("marks a rise as danger when down is good", () => {
    renderUI(<StatCard label="Errors" value={3} delta={20} deltaGood="down" />);
    expect(screen.getByText(/20%/)).toHaveAttribute("data-tone", "danger");
  });
  it("renders loading and error states", () => {
    const { container, rerender } = renderUI(<StatCard label="X" loading />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading");
    expect(container.firstElementChild).toHaveAttribute("aria-busy", "true");
    rerender(<StatCard label="X" error="Failed to load" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Failed to load");
  });
  it("renders the sparkline slot and string values", () => {
    renderUI(<StatCard label="Grade" value="A−" sparkline={<svg data-testid="spark" />} />);
    expect(screen.getByText("A−")).toBeInTheDocument();
    expect(screen.getByTestId("spark")).toBeInTheDocument();
  });
});
