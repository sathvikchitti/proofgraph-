import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LineChart as RLineChart, Line } from "recharts";
import { renderUI } from "../../test/utils";
import { ChartFrame, ChartTooltip } from "./chart-frame";

const chart = (
  <RLineChart data={[{ x: 1, y: 2 }]}>
    <Line dataKey="y" />
  </RLineChart>
);

describe("ChartFrame", () => {
  it("renders a labelled figure with an image role and legend", () => {
    renderUI(<ChartFrame label="Scores" width={300} legend={[{ label: "Honesty", color: "red" }]}>{chart}</ChartFrame>);
    expect(screen.getByRole("figure")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Scores" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Legend" })).toHaveTextContent("Honesty");
  });
  it("shows loading, empty and error states instead of the chart", async () => {
    const onRetry = vi.fn();
    const { rerender } = renderUI(<ChartFrame label="S" loading>{chart}</ChartFrame>);
    expect(screen.getByRole("status")).toHaveTextContent("Loading chart");
    expect(screen.getByRole("figure")).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByRole("img", { name: "S" })).toBeNull();
    rerender(<ChartFrame label="S" isEmpty emptyLabel="Nothing yet">{chart}</ChartFrame>);
    expect(screen.getByText("Nothing yet")).toBeInTheDocument();
    rerender(<ChartFrame label="S" error={new Error("down")} onRetry={onRetry}>{chart}</ChartFrame>);
    expect(screen.getByRole("alert")).toHaveTextContent("down");
    await userEvent.click(screen.getByRole("button", { name: /Try again/ }));
    expect(onRetry).toHaveBeenCalled();
  });
});

describe("ChartTooltip", () => {
  it("renders rows with formatted values and nothing when inactive", () => {
    const { container, rerender } = renderUI(<ChartTooltip active payload={[{ name: "Honesty", value: 70, color: "red", dataKey: "h" }]} label="Jan" formatValue={(v) => `${v} pts`} />);
    expect(container).toHaveTextContent("Jan");
    expect(container).toHaveTextContent("Honesty");
    expect(container).toHaveTextContent("70 pts");
    rerender(<ChartTooltip active={false} payload={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
